import {
  commentSelector,
  highlightedCommentClass,
  threadPostIdRegex,
  threadPostSelector,
  timestampIdPrefix,
} from './constants';
import { addThread, getThread, globalDb, addComment, updateThread } from './database';

// CommentTopMeta--Created--t1_k8etzzz from t1_k8etzzz
const getTimestampIdFromCommentId = (commentId: string) => timestampIdPrefix + commentId;

const getTimestampFromCommentId = (commentId: string): Date | null => {
  const timestampId = getTimestampIdFromCommentId(commentId);
  const timestampElement = document.querySelector<HTMLElement>(`#${timestampId}`);
  if (!timestampElement) return null;

  // 2 hr. ago
  const timeAgo = timestampElement.textContent;
  // calc
  return new Date();
};

export const getThreadId = (): string | null => {
  const threadElement = document.querySelector<HTMLElement>(threadPostSelector);

  const threadId =
    threadElement && threadPostIdRegex.test(threadElement.id)
      ? threadElement.id.replace(threadPostIdRegex, '')
      : null;

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

// only elements with ids
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

const highlight = (commentElements: NodeListOf<HTMLElement>) => {
  commentElements.forEach((commentElement) => {
    // compare with db here
    commentElement.classList.add(highlightedCommentClass);
  });
};

const markAsRead = async (commentElements: NodeListOf<HTMLElement>) => {
  if (!(commentElements.length > 0)) return;

  const db = globalDb;
  if (!db) return;

  let threadIdFromDom = getThreadId();
  if (!threadIdFromDom) return;

  // add new thread if it doesn't exist
  const thread =
    (await getThread(db, threadIdFromDom)) ??
    (await addThread(db, { threadId: threadIdFromDom, updatedAt: new Date() }).catch(
      (error) => console.error(error)
    ));

  const threadId = thread?.threadId;
  if (!threadId) return;

  const initialCommentId = commentElements[0].id;
  const latestCommentUpdater = createLatestCommentUpdater(
    initialCommentId,
    getTimestampFromCommentId(initialCommentId)
  );

  commentElements.forEach(async (commentElement, index) => {
    if (!isElementInViewport(commentElement) || !commentElement.id) return;

    // check time
    // add comment id in db
    const { threadId } = thread;
    await addComment(db, { commentId: commentElement.id, threadId });

    // get latest comment
    latestCommentUpdater.updateLatestComment(commentElement, index);
  });

  const { latestCommentId, latestCommentTimestamp } =
    latestCommentUpdater.getLatestComment();

  // update thread bellow forEach
  await updateThread(db, {
    threadId,
    updatedAt: new Date(),
    ...(latestCommentId && { latestCommentId }),
    ...(latestCommentTimestamp && { latestCommentTimestamp }),
  }).catch((error) => console.error(error));
};

const createLatestCommentUpdater = (
  initialCommentId: string,
  initialTimestamp: Date | null
) => {
  let latestCommentId = initialCommentId;
  let latestCommentTimestamp = initialTimestamp;

  const updateLatestComment = (commentElement: HTMLElement, index: number) => {
    const currentTimestamp = getTimestampFromCommentId(commentElement.id);

    if (index === 0 || !latestCommentTimestamp || !currentTimestamp) return;

    if (currentTimestamp > latestCommentTimestamp) {
      latestCommentId = commentElement.id;
      latestCommentTimestamp = currentTimestamp;
    }
  };

  return {
    updateLatestComment,
    getLatestComment: () => ({ latestCommentId, latestCommentTimestamp }),
  };
};

export const traverseComments = () => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);

  markAsRead(commentElements);
  highlight(commentElements);
};
