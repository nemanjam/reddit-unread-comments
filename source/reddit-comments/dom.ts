import {
  MyCreateModelFailedDBException,
  MyElementNotFoundDOMException,
  MyModelNotFoundDBException,
} from './exceptions';
import {
  commentSelector,
  currentSessionCreatedAt,
  defaultRealtimeUnHighlightMode,
  highlightedCommentClass,
  highlightedCommentReadClass,
  markAsReadDelay,
  modalScrollContainerSelector,
  threadPostSelector,
  timestampIdModalSuffix,
  timestampIdPrefix,
} from './constants';
import {
  addThread,
  getThread,
  openDatabase,
  addComment,
  updateThread,
  ThreadData,
  getCommentsForThreadWithoutCurrentSession,
  updateCommentsSessionCreatedAtForThread,
  CommentData,
  getCommentsForThreadForCurrentSession,
  getAllCommentsForThread,
  truncateDatabase,
} from './database';
import { relativeTimeStringToDate } from './datetime';
import {
  validateCommentElementIdOrThrow,
  validateThreadElementIdOrThrow,
} from './validation';
import { delayExecution, isActiveTab } from './utils';

// CommentTopMeta--Created--t1_k8etzzz from t1_k8etzzz
const getTimestampIdFromCommentId = (commentId: string) => {
  const modalSuffix = hasModalScrollContainer() ? timestampIdModalSuffix : '';
  const timestampId = timestampIdPrefix + commentId + modalSuffix;
  return timestampId;
};

const getDateFromCommentId = (commentId: string): Date => {
  const timestampId = getTimestampIdFromCommentId(commentId);
  const timestampElement = document.querySelector<HTMLElement>(`#${timestampId}`);

  if (!timestampElement)
    throw new MyElementNotFoundDOMException(
      `Comment timestamp element with timestampId: ${timestampId} not found.`
    ); // here, blocked users

  // 2 hr. ago
  const timeAgo = timestampElement.innerHTML;

  const date = relativeTimeStringToDate(timeAgo);
  return date;
};

export const hasModalScrollContainer = (): boolean => {
  const modalScrollContainer = document.querySelector<HTMLElement>(
    modalScrollContainerSelector
  );
  return Boolean(modalScrollContainer);
};

export const getScrollElement = () => {
  // detect modal
  const modalScrollContainer = document.querySelector<HTMLElement>(
    modalScrollContainerSelector
  );
  const scrollElement = modalScrollContainer ?? document;
  return scrollElement;
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

/**
 * Highlights all comments except from current session.
 *
 * if session:
 * onUrlChange - creates session
 * onScroll - doesn't create session
 */
const highlight = async (commentElements: NodeListOf<HTMLElement>) => {
  const db = await openDatabase();
  const threadIdFromDom = getThreadIdFromDom();

  // works for both realtime and onUrlChange un-highlight, no need for getAllCommentsForThread()
  const readComments = await getCommentsForThreadWithoutCurrentSession(
    db,
    threadIdFromDom
  );
  const readCommentsIds = readComments.map((comment) => comment.commentId);

  commentElements.forEach(async (commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    // disjunction between all comments and read comments in db
    const isReadComment = readCommentsIds.includes(commentId);

    const hasClassAlready = commentElement.classList.contains(highlightedCommentClass);

    if (!hasClassAlready && !isReadComment) {
      console.log('adding highlight class');
      commentElement.classList.add(highlightedCommentClass);
    }

    // remove highlight // if needed
    if (hasClassAlready && isReadComment) {
      console.log('replacing with read highlight class');
      commentElement.classList.replace(
        highlightedCommentClass,
        highlightedCommentReadClass
      );
    }
  });
};

/** Mutates only database, no live DOM updates. */
const markAsRead = async (commentElements: NodeListOf<HTMLElement>) => {
  const db = await openDatabase();

  const thread = await getCurrentThread();
  const { threadId } = thread;

  // already marked comments as read in db
  // prevent adding already added comments, same id will throw
  // realtime unHighlight vs onUrlChange, first difference
  const currentSessionComments = defaultRealtimeUnHighlightMode
    ? await getAllCommentsForThread(db, threadId)
    : await getCommentsForThreadForCurrentSession(db, threadId);

  const currentSessionCommentsIds = currentSessionComments.map(
    (comment) => comment.commentId
  );

  // unfiltered comments here, for entire session, only new are fine?
  const initialCommentId = validateCommentElementIdOrThrow(commentElements[0]);
  const latestCommentUpdater = createLatestCommentUpdater(
    initialCommentId,
    getDateFromCommentId(initialCommentId)
  );

  commentElements.forEach(async (commentElement, index) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    const isAlreadyMarkedComment = currentSessionCommentsIds.includes(commentId); // all checks in one loop

    if (!isElementInViewport(commentElement) || isAlreadyMarkedComment) return;

    // check time...

    // second difference
    const sessionCreatedAt = defaultRealtimeUnHighlightMode
      ? thread.updatedAt
      : currentSessionCreatedAt;

    await addComment(db, {
      threadId,
      commentId,
      sessionCreatedAt,
    });

    // get latest comment
    latestCommentUpdater.updateLatestComment(commentId, index);
  });

  const { latestCommentId, latestCommentDate } = latestCommentUpdater.getLatestComment();

  // update thread bellow forEach
  await updateThread(db, {
    threadId,
    ...(latestCommentId && { latestCommentId }),
    ...(latestCommentDate && { latestCommentTimestamp: latestCommentDate.getTime() }),
  });
};

// todo: compare comments from database too, no they are older
const createLatestCommentUpdater = (initialCommentId: string, initialDate: Date) => {
  let latestCommentId = initialCommentId;
  let latestCommentDate = initialDate;

  const updateLatestComment = (commentId: string, index: number) => {
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

const getCurrentThread = async (): Promise<ThreadData> => {
  const db = await openDatabase();
  const threadIdFromDom = getThreadIdFromDom();

  const thread = await getThread(db, threadIdFromDom);

  if (!thread)
    throw new MyModelNotFoundDBException(
      `Thread with threadIdFromDom: ${threadIdFromDom} not found.`
    );

  return thread;
};

export const updateCommentsFromPreviousSessionOrCreateThread = async (): Promise<{
  isExistingThread: boolean;
  updatedComments: CommentData[];
  thread: ThreadData;
}> => {
  const db = await openDatabase();
  const threadIdFromDom = getThreadIdFromDom();

  const existingThread = await getThread(db, threadIdFromDom);

  if (existingThread) {
    const { threadId, updatedAt } = existingThread;
    const updatedComments = await updateCommentsSessionCreatedAtForThread(
      db,
      threadId,
      updatedAt
    );

    const message =
      updatedComments.length > 0
        ? `Updated ${updatedComments.length} pending comments from previous session.`
        : 'No pending comments to update from previous session.';
    console.log(message);

    const result = {
      isExistingThread: true,
      updatedComments,
      thread: existingThread,
    };
    return result;
  }

  // add new thread if it doesn't exist
  const newThread = await addThread(db, {
    threadId: threadIdFromDom,
    updatedAt: new Date().getTime(), // first run creates session - comment.currentCreatedAt
  });

  if (!newThread)
    throw new MyCreateModelFailedDBException('Failed to create new Thread.');

  const result = {
    isExistingThread: false,
    updatedComments: [],
    thread: newThread,
  };
  return result;
};

/** onScroll - markAsRead, highlight */
export const handleScrollDom = async () => {
  // disable handlers too, and not attaching only
  if (!isActiveTab()) return;

  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  if (!(commentElements.length > 0)) return;

  try {
    if (defaultRealtimeUnHighlightMode)
      await delayExecution(markAsRead, markAsReadDelay, commentElements);
    else await markAsRead(commentElements);

    await highlight(commentElements);
  } catch (error) {
    console.error('Error handling comments onScroll:', error);
  }
};

/** updateCommentsFromPreviousSession, highlight */
export const handleUrlChangeDom = async () => {
  if (!isActiveTab()) return;

  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  if (!(commentElements.length > 0)) return;

  try {
    await truncateDatabase();

    await updateCommentsFromPreviousSessionOrCreateThread();
    await highlight(commentElements);
  } catch (error) {
    console.error('Error handling comments onUrlChange:', error);
  }
};
