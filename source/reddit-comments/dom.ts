import { MyElementNotFoundDOMException } from './exceptions';
import {
  commentSelector,
  currentSessionCreatedAt,
  highlightedCommentClass,
  modalScrollContainerSelector,
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
  getAllCommentsForThreadWithoutCurrentSession,
} from './database';
import { relativeTimeStringToDate } from './datetime';
import {
  validateCommentElementIdOrThrow,
  validateThreadElementIdOrThrow,
} from './validation';

// CommentTopMeta--Created--t1_k8etzzz from t1_k8etzzz
const getTimestampIdFromCommentId = (commentId: string) => timestampIdPrefix + commentId;

const getDateFromCommentId = (commentId: string): Date => {
  const timestampId = getTimestampIdFromCommentId(commentId);
  const timestampElement = document.querySelector<HTMLElement>(`#${timestampId}`);

  if (!timestampElement)
    throw new MyElementNotFoundDOMException('Comment timestamp element not found.');

  // 2 hr. ago
  const timeAgo = timestampElement.innerHTML;

  const date = relativeTimeStringToDate(timeAgo);
  return date;
};

/** Throws DOM exceptions. */
export const getThreadIdFromDom = (): string => {
  const threadElement = document.querySelector<HTMLElement>(threadPostSelector);

  if (!threadElement)
    throw new MyElementNotFoundDOMException(
      'Thread element not found in DOM by attribute.'
    );

  const threadId = validateThreadElementIdOrThrow(threadElement);

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

const highlight = async (commentElements: NodeListOf<HTMLElement>) => {
  const threadIdFromDom = getThreadIdFromDom();
  const db = await openDatabase();

  commentElements.forEach(async (commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    const readComments = await getAllCommentsForThreadWithoutCurrentSession(
      db,
      threadIdFromDom
    );

    const isReadComment = readComments
      .map((comment) => comment.commentId)
      .includes(commentId);

    if (!isReadComment) commentElement.classList.add(highlightedCommentClass);
  });
};

const markAsRead = async (
  commentElements: NodeListOf<HTMLElement>,
  source: TraverseCommentsSource
) => {
  const db = await openDatabase();

  const { threadId } = await getOrCreateThread();

  // if (source === 'onUrlChange') await updateCommentsFromPreviousSession()
  // if (source === 'onScroll') const currentSessionComments = await getCommentsFromCurrentSession()

  const initialCommentId = validateCommentElementIdOrThrow(commentElements[0]);
  const latestCommentUpdater = createLatestCommentUpdater(
    initialCommentId,
    getDateFromCommentId(initialCommentId)
  );

  commentElements.forEach(async (commentElement, index) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);

    if (!isElementInViewport(commentElement)) return;

    // if (!currentSessionComments.includes(commentId))
    // check time
    // add comment id in db
    await addComment(db, {
      threadId,
      commentId,
      sessionCreatedAt: currentSessionCreatedAt,
    });

    // get latest comment
    // latestCommentUpdater.updateLatestComment(commentElement, index);
  });

  const { latestCommentId, latestCommentDate } = latestCommentUpdater.getLatestComment();

  // update thread bellow forEach
  await updateThread(db, {
    threadId,
    updatedAt: new Date().getTime(), // not this, session
    ...(latestCommentId && { latestCommentId }),
    ...(latestCommentDate && { latestCommentTimestamp: latestCommentDate.getTime() }),
  });
};

const createLatestCommentUpdater = (initialCommentId: string, initialDate: Date) => {
  let latestCommentId = initialCommentId;
  let latestCommentDate = initialDate;

  const updateLatestComment = (commentElement: HTMLElement, index: number) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    const currentDate = getDateFromCommentId(commentId);

    if (index === 0) return;

    if (currentDate > latestCommentDate) {
      latestCommentId = commentId;
      latestCommentDate = currentDate;
    }
  };

  return {
    updateLatestComment,
    getLatestComment: () => ({ latestCommentId, latestCommentDate }),
  };
};

export const getOrCreateThread = async () => {
  const db = await openDatabase();
  const threadIdFromDom = getThreadIdFromDom();

  // add new thread if it doesn't exist
  const thread =
    (await getThread(db, threadIdFromDom)) ??
    ((await addThread(db, {
      threadId: threadIdFromDom,
      updatedAt: new Date().getTime(),
    })) as ThreadData);

  return thread;
};

export const getScrollElement = () => {
  // detect modal
  const modalScrollContainer = document.querySelector<HTMLElement>(
    modalScrollContainerSelector
  );
  const scrollElement = modalScrollContainer ?? document;
  return scrollElement;
};

type TraverseCommentsSource = 'onUrlChange' | 'onScroll';

export const traverseComments = async (source: TraverseCommentsSource) => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  if (!(commentElements.length > 0)) return;

  try {
    await markAsRead(commentElements, source);
    await highlight(commentElements);
  } catch (error) {
    console.error('Error traversing comments:', error);
  }
};
