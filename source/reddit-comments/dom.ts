import {
  MyCreateModelFailedDBException,
  MyElementNotFoundDOMException,
  MyModelNotFoundDBException,
} from './exceptions';
import {
  allHighlightedCommentsSelector,
  commentSelector,
  currentSessionCreatedAt,
  defaultUnHighlightMode,
  highlightedCommentByDateClass,
  highlightedCommentClass,
  highlightedCommentReadClass,
  markAsReadDelay,
  modalHeaderSelector,
  modalScrollContainerSelector,
  pageHeaderSelector,
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
  limitIndexedDBSize,
} from './database';
import { getDateHoursAgo, relativeTimeStringToDate } from './datetime';
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
  // handle thread post on page and on modal, modalContainer or document
  const scrollElement = getScrollElement();
  const threadElement = scrollElement.querySelector<HTMLElement>(threadPostSelector);

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

// app uses Date, database uses timestamp
const highlightByDate = (commentElements: NodeListOf<HTMLElement>, newerThan: Date) => {
  const filteredComments =
    sortedCommentsByDateUpdater.getFilteredNewerCommentsByDate(newerThan);
  const filteredCommentsIds = filteredComments.map((comment) => comment.commentId);

  commentElements.forEach((commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);

    const isCommentNewerThan = filteredCommentsIds.includes(commentId);

    const hasHighlightedByDateClassAlready = commentElement.classList.contains(
      highlightedCommentByDateClass
    );

    // both highlight and un-highlight always, slider can change

    // highlighting
    if (!hasHighlightedByDateClassAlready && isCommentNewerThan) {
      console.log('Adding highlight by date class.');
      commentElement.classList.add(highlightedCommentByDateClass);
    }

    // un-highlighting
    if (hasHighlightedByDateClassAlready && !isCommentNewerThan) {
      console.log('Removing highlight by date class.');
      commentElement.classList.remove(highlightedCommentByDateClass);
    }
  });
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
  const readCommentsPreviousSessions = await getCommentsForThreadWithoutCurrentSession(
    db,
    threadIdFromDom
  );
  const readCommentsCurrentSession = await getCommentsForThreadForCurrentSession(
    db,
    threadIdFromDom
  );

  const readCommentsPreviousSessionsIds = readCommentsPreviousSessions.map(
    (comment) => comment.commentId
  );
  const readCommentsCurrentSessionIds = readCommentsCurrentSession.map(
    (comment) => comment.commentId
  );

  commentElements.forEach(async (commentElement) => {
    const hasHighlightedReadClassAlready = commentElement.classList.contains(
      highlightedCommentReadClass
    );
    // handled comment already
    if (hasHighlightedReadClassAlready) return;

    const commentId = validateCommentElementIdOrThrow(commentElement);
    // disjunction between all comments and read comments in db
    const isReadCommentPreviousSessions =
      readCommentsPreviousSessionsIds.includes(commentId);
    const isReadCommentCurrentSession = readCommentsCurrentSessionIds.includes(commentId);

    if (isReadCommentPreviousSessions) return;

    const hasHighlightedClassAlready = commentElement.classList.contains(
      highlightedCommentClass
    );

    // highlighting
    if (!hasHighlightedClassAlready && !isReadCommentCurrentSession) {
      console.log('Adding highlight class.');
      commentElement.classList.add(highlightedCommentClass);
    }

    if (defaultUnHighlightMode !== 'scroll') return;

    // un-highlighting
    if (hasHighlightedClassAlready && isReadCommentCurrentSession) {
      console.log('Replacing highlight with highlight-read class.');
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

  // all read comments from all sessions
  // updating comments only onUrlChange, thread load
  const allSessionsComments = await getAllCommentsForThread(db, threadId);
  const allSessionsCommentsIds = allSessionsComments.map((comment) => comment.commentId);

  // unfiltered comments here, for entire session, only new are fine?
  sortedCommentsByDateUpdater.reset(commentElements[0]);

  commentElements.forEach(async (commentElement, index) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    const isAlreadyMarkedComment = allSessionsCommentsIds.includes(commentId); // all checks in one loop

    if (!isElementInViewport(commentElement) || isAlreadyMarkedComment) return;

    // check time...

    const sessionCreatedAt = currentSessionCreatedAt;
    await addComment(db, { threadId, commentId, sessionCreatedAt });

    // update sorted comments
    sortedCommentsByDateUpdater.updateSortedComments(commentId);
  });

  const { latestComment } = sortedCommentsByDateUpdater.getSortedComments();

  const { commentId: latestCommentId, date: latestCommentDate } = latestComment;

  // update thread bellow forEach
  await updateThread(db, {
    threadId,
    ...(latestCommentId && { latestCommentId }),
    ...(latestCommentDate && { latestCommentTimestamp: latestCommentDate.getTime() }),
  });
};

interface CommentWithDate {
  commentId: string;
  /** Date object, Timestamp in db. */
  date: Date;
}
interface SortedResult {
  latestComment: CommentWithDate;
  sortedComments: CommentWithDate[];
}

// todo: compare comments from database too, no they are older
const createSortedCommentsByDateUpdater = () => {
  let comments: CommentWithDate[] = [];
  let latestComment: CommentWithDate | null = null;

  const updateSortedComments = (commentId: string) => {
    const newComment = { commentId, date: getDateFromCommentId(commentId) };
    comments.push(newComment);

    comments.sort((a, b) => b.date.getTime() - a.date.getTime());
    latestComment = comments[0];
  };

  const reset = (commentElement: HTMLElement) => {
    const initialCommentId = validateCommentElementIdOrThrow(commentElement);
    const initialComment: CommentWithDate = {
      commentId: initialCommentId,
      date: getDateFromCommentId(initialCommentId),
    };

    comments = [initialComment];
    latestComment = initialComment;
  };

  const getFilteredNewerCommentsByDate = (date: Date): CommentWithDate[] => {
    checkIfEmptyCommentsArray('getFilteredNewerCommentsByDate');

    return comments.filter((comment) => comment.date.getTime() > date.getTime());
  };

  const getSortedComments = (): SortedResult => {
    checkIfEmptyCommentsArray('getSortedComments');

    const sortedResult = { latestComment, sortedComments: comments } as SortedResult;
    return sortedResult;
  };

  const checkIfEmptyCommentsArray = (fnName: string) => {
    if (!latestComment || !(comments.length > 0))
      throw new MyElementNotFoundDOMException(
        `sortedCommentsByDateUpdater.${fnName} called with empty comments array.`
      );
  };

  return {
    reset,
    updateSortedComments,
    getSortedComments,
    getFilteredNewerCommentsByDate,
  };
};

/** Global. */
const sortedCommentsByDateUpdater = createSortedCommentsByDateUpdater();

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

  // reduce db size here, before adding new thread
  await limitIndexedDBSize(db);

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

export const getHeaderHeight = () => {
  if (hasModalScrollContainer()) {
    const modalHeaderElement = document.querySelector(modalHeaderSelector);
    if (!modalHeaderElement)
      throw new MyElementNotFoundDOMException('Modal header element not found.');

    const headerHeight = modalHeaderElement.getBoundingClientRect().height;
    return headerHeight;
  }

  const headerElement = document.querySelector(pageHeaderSelector);
  if (!headerElement)
    throw new MyElementNotFoundDOMException('Header element not found.');

  const headerHeight = headerElement.getBoundingClientRect().height;
  return headerHeight;
};

let currentIndex = 0;
export const scrollNextCommentIntoView = (scrollToFirstComment = false) => {
  const commentElements = document.querySelectorAll<HTMLElement>(
    allHighlightedCommentsSelector
  );

  if (!(commentElements.length > 0)) return;

  if (scrollToFirstComment || currentIndex >= commentElements.length) currentIndex = 0;

  const commentElement = commentElements[currentIndex];
  const commentRect = commentElement.getBoundingClientRect();

  const modalScrollContainer = document.querySelector<HTMLElement>(
    modalScrollContainerSelector
  );

  const headerHeight = getHeaderHeight();

  if (modalScrollContainer) {
    const commentOffsetTop = commentElement.getBoundingClientRect().top;
    const modalOffsetTop = modalScrollContainer.getBoundingClientRect().top;

    const targetScrollTop =
      modalScrollContainer.scrollTop + commentOffsetTop - modalOffsetTop - headerHeight;

    modalScrollContainer.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
  } else {
    window.scrollTo({
      top: commentRect.top + window.scrollY - headerHeight,
      behavior: 'smooth',
    });
  }

  currentIndex++;
};

/** onScroll - markAsRead, highlight */
export const handleScrollDom = async () => {
  // disable handlers too, and not attaching only
  if (!isActiveTab() || true) return;

  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  if (!(commentElements.length > 0)) return;

  try {
    if (defaultUnHighlightMode === 'scroll')
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
  // only root check, child functions must have commentElements array filled
  if (!(commentElements.length > 0)) return;

  try {
    // await updateCommentsFromPreviousSessionOrCreateThread();
    // await highlight(commentElements);

    // must disable other highlighting
    highlightByDate(commentElements, getDateHoursAgo(3 * 24));
  } catch (error) {
    console.error('Error handling comments onUrlChange:', error);
  }
};
