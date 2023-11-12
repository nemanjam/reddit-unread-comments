import {
  commentIdRegexValidate,
  commentSelector,
  highlightedCommentClass,
  threadPostIdRegexValidate,
  threadPostSelector,
  timestampIdPrefix,
} from './constants';
import {
  addThread,
  getThread,
  openDatabase,
  addComment,
  updateThread,
  ThreadData,
  getAllCommentsForThread,
} from './database';
import { relativeTimeStringToDate } from './datetime';

// CommentTopMeta--Created--t1_k8etzzz from t1_k8etzzz
const getTimestampIdFromCommentId = (commentId: string) => timestampIdPrefix + commentId;

// todo: fix error handling here, in all dom query functions
const getDateFromCommentId = (commentId: string): Date | null => {
  const timestampId = getTimestampIdFromCommentId(commentId);
  const timestampElement = document.querySelector<HTMLElement>(`#${timestampId}`);

  // 2 hr. ago
  const timeAgo = timestampElement?.textContent;
  if (!timeAgo) return null;

  const date = relativeTimeStringToDate(timeAgo);
  return date;
};

/** Returns boolean. */
export const validateThreadId = (threadId: string): boolean =>
  threadPostIdRegexValidate.test(threadId);

export const validateCommentId = (commentId: string): boolean =>
  commentIdRegexValidate.test(commentId);

export const getThreadId = (): string | null => {
  const threadElement = document.querySelector<HTMLElement>(threadPostSelector);

  const threadId =
    threadElement && validateThreadId(threadElement.id) ? threadElement.id : null;

  return threadId;
};

// sync
const isElementInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// only elements with ids, unused
export const filterVisibleElements = (elements: NodeListOf<HTMLElement>) => {
  const visibleElements: HTMLElement[] = [];

  // MUST work with original NodeList.forEach
  elements.forEach((element) => {
    if (isElementInViewport(element)) visibleElements.push(element);
  });

  const selector = visibleElements.map((element) => `#${element.id}`).join(',');

  const selectedElements = document.querySelectorAll(selector);
  return selectedElements;
};

// todo: filter un-highlight only from last session
const highlight = async (commentElements: NodeListOf<HTMLElement>) => {
  const threadIdFromDom = getThreadId();
  const db = await openDatabase();

  // fix this with try catch
  if (!db || !threadIdFromDom) return;

  commentElements.forEach(async (commentElement) => {
    // compare with db here
    const readComments = await getAllCommentsForThread(db, threadIdFromDom);
    const isReadComment = readComments
      .map((comment) => comment.commentId)
      .includes(commentElement.id);

    if (!isReadComment) commentElement.classList.add(highlightedCommentClass);
  });
};

const markAsRead = async (commentElements: NodeListOf<HTMLElement>) => {
  if (!(commentElements.length > 0)) return;

  const db = await openDatabase();
  if (!db) return;

  let threadIdFromDom = getThreadId();
  if (!threadIdFromDom) return;

  // add new thread if it doesn't exist
  const thread =
    (await getThread(db, threadIdFromDom)) ??
    ((await addThread(db, {
      threadId: threadIdFromDom,
      updatedAt: new Date().getTime(),
    }).catch((error) => console.error(error))) as ThreadData);

  const threadId = thread?.threadId;
  if (!threadId) return;

  const initialCommentId = commentElements[0].id;
  const latestCommentUpdater = createLatestCommentUpdater(
    initialCommentId,
    getDateFromCommentId(initialCommentId)
  );

  commentElements.forEach(async (commentElement, index) => {
    if (!validateCommentId(commentElement.id) || !isElementInViewport(commentElement))
      return;

    // check time
    // add comment id in db
    const { threadId } = thread;
    await addComment(db, { commentId: commentElement.id, threadId });

    // get latest comment
    // latestCommentUpdater.updateLatestComment(commentElement, index);
  });

  const { latestCommentId, latestCommentDate } = latestCommentUpdater.getLatestComment();

  // update thread bellow forEach
  await updateThread(db, {
    threadId,
    updatedAt: new Date().getTime(),
    ...(latestCommentId && { latestCommentId }),
    ...(latestCommentDate && { latestCommentTimestamp: latestCommentDate.getTime() }),
  }).catch((error) => console.error(error));
};

const createLatestCommentUpdater = (
  initialCommentId: string,
  initialDate: Date | null
) => {
  let latestCommentId = initialCommentId;
  let latestCommentDate = initialDate;

  const updateLatestComment = (commentElement: HTMLElement, index: number) => {
    const currentDate = getDateFromCommentId(commentElement.id);

    if (index === 0 || !latestCommentDate || !currentDate) return;

    if (currentDate > latestCommentDate) {
      latestCommentId = commentElement.id;
      latestCommentDate = currentDate;
    }
  };

  return {
    updateLatestComment,
    getLatestComment: () => ({ latestCommentId, latestCommentDate }),
  };
};

export const traverseComments = () => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);

  markAsRead(commentElements);
  highlight(commentElements);
};
