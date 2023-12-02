import {
  MyCreateModelFailedDBException,
  MyElementNotFoundDOMException,
} from './exceptions';
import {
  commentSelector,
  currentSessionCreatedAt,
  highlightedCommentByDateClass,
  highlightedCommentClass,
  highlightedCommentReadClass,
  markAsReadDelay,
  modalHeaderSelector,
  modalScrollContainerSelector,
  pageHeaderSelector,
  sortByNewMenuItemSelector,
  sortMenuSelector,
  sortMenuSpanTextSelector,
  sortMenuWait,
  threadPostSelector,
  timestampIdModalSuffix,
  timestampIdPrefix,
} from './constants';

import { openDatabase, ThreadData } from './database/schema';
import {
  addThread,
  getThread,
  updateThread,
  getCommentsForThreadWithoutCurrentSession,
  updateCommentsSessionCreatedAtForThread,
  getCommentsForThreadForCurrentSession,
  getAllCommentsForThread,
} from './database/models/thread';
import { addComment } from './database/models/comment';
import { getAllDbData, limitIndexedDBSize } from './database/limit-size';

import { radioAndSliderToDate, relativeTimeStringToDate } from './datetime';
import {
  validateCommentElementIdOrThrow,
  validateThreadElementIdOrThrow,
} from './validation';
import { delayExecution, isActiveTab, wait } from './utils';
import { getSettings } from './database/models/settings';
import logger from './logger';

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

export const clickSortByNewMenuItem = async (): Promise<boolean> => {
  // check if its new already
  const sortMenuSpan = document.querySelector<HTMLElement>(sortMenuSpanTextSelector);
  if (!sortMenuSpan) return false;

  if (sortMenuSpan.innerHTML.toLowerCase().includes('new')) return false; // new already

  // get menu
  const sortMenu = document.querySelector<HTMLElement>(sortMenuSelector);
  if (!sortMenu) return false;

  sortMenu.click();
  await wait(sortMenuWait);

  // get items
  const menuItems = document.querySelectorAll<HTMLElement>(sortByNewMenuItemSelector);

  let sortByNewMenuItem: HTMLElement | null = null;
  menuItems.forEach((element) => {
    if (element.innerHTML.toLowerCase().includes('new')) sortByNewMenuItem = element;
  });

  if (sortByNewMenuItem) (sortByNewMenuItem as HTMLElement).click();

  return true;
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

const getFilteredNewerCommentsByDate = (
  commentElements: HTMLElement[],
  newerThan: Date
): HTMLElement[] => {
  const filteredComments = commentElements.filter((commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    const commentDate = getDateFromCommentId(commentId);
    return commentDate.getTime() > newerThan.getTime();
  });

  return filteredComments;
};

/** Works only with DOM elements, no database. */
const highlightByDate = (commentElements: NodeListOf<HTMLElement>, newerThan: Date) => {
  const commentsArray = Array.from(commentElements);
  const filteredComments = getFilteredNewerCommentsByDate(commentsArray, newerThan);
  const filteredCommentsIds = filteredComments.map((commentElement) => commentElement.id);

  commentElements.forEach((commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);

    const isCommentNewerThan = filteredCommentsIds.includes(commentId);

    const hasHighlightedByDateClassAlready = commentElement.classList.contains(
      highlightedCommentByDateClass
    );

    // both highlight and un-highlight always, slider can change

    // highlighting
    if (isCommentNewerThan) {
      if (!hasHighlightedByDateClassAlready)
        commentElement.classList.add(highlightedCommentByDateClass);
    }

    // un-highlighting
    if (!isCommentNewerThan) {
      if (hasHighlightedByDateClassAlready)
        commentElement.classList.remove(highlightedCommentByDateClass);
    }
  });
};

export const removeHighlightReadClass = () => {
  const highlightedReadElements = document.querySelectorAll<HTMLElement>(
    `.${highlightedCommentReadClass}`
  );
  highlightedReadElements.forEach((commentElement) => {
    commentElement.classList.remove(highlightedCommentReadClass);
  });
};

export const removeHighlightByDateClass = () => {
  const highlightedElementsByDate = document.querySelectorAll<HTMLElement>(
    `.${highlightedCommentByDateClass}`
  );
  highlightedElementsByDate.forEach((commentElement) => {
    commentElement.classList.remove(highlightedCommentByDateClass);
  });
};

export const getAllComments = (): NodeListOf<HTMLElement> => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  return commentElements;
};

/** Only this one should be used. */
export const highlightByDateWithSettingsData = async (
  commentElements: NodeListOf<HTMLElement>
) => {
  const db = await openDatabase();
  const settings = await getSettings(db);
  const { isHighlightOnTime, timeScale, timeSlider } = settings;

  if (isHighlightOnTime) {
    const dateInPast = radioAndSliderToDate({ timeScale, timeSlider });
    highlightByDate(commentElements, dateInPast);
  }
};

/**
 * if session:
 * onUrlChange - creates session
 * onScroll - doesn't create session
 */
export const highlight = async (commentElements: NodeListOf<HTMLElement>) => {
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
  const { unHighlightOn } = await getSettings(db);

  const readCommentsPreviousSessionsIds = readCommentsPreviousSessions.map(
    (comment) => comment.commentId
  );
  const readCommentsCurrentSessionIds = readCommentsCurrentSession.map(
    (comment) => comment.commentId
  );

  commentElements.forEach(async (commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    // disjunction between all comments and read comments in db
    const isReadCommentPreviousSessions =
      readCommentsPreviousSessionsIds.includes(commentId);
    const isReadCommentCurrentSession = readCommentsCurrentSessionIds.includes(commentId);

    if (isReadCommentPreviousSessions) return;

    // state must come from db, never from dom
    const hasHighlightedClassAlready = commentElement.classList.contains(
      highlightedCommentClass
    );
    const hasHighlightedReadClassAlready = commentElement.classList.contains(
      highlightedCommentReadClass
    );

    if (unHighlightOn === 'on-scroll') {
      // highlighting
      if (!isReadCommentCurrentSession) {
        // check when adding or removing class to avoid double
        if (!hasHighlightedClassAlready)
          commentElement.classList.add(highlightedCommentClass);
      }

      // un-highlighting
      if (isReadCommentCurrentSession) {
        if (hasHighlightedClassAlready)
          commentElement.classList.remove(highlightedCommentClass);

        // highlighting read
        if (!hasHighlightedReadClassAlready)
          commentElement.classList.add(highlightedCommentReadClass);
      }
    }

    if (unHighlightOn === 'on-url-change') {
      // highlighting
      if (!isReadCommentCurrentSession) {
        if (!hasHighlightedClassAlready)
          commentElement.classList.add(highlightedCommentClass);
      }

      // un-highlighting
      // remove unconditionally
      if (hasHighlightedReadClassAlready)
        commentElement.classList.remove(highlightedCommentReadClass);
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
  const latestCommentUpdater = createLatestCommentUpdater(commentElements[0]);

  commentElements.forEach(async (commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    const isAlreadyMarkedComment = allSessionsCommentsIds.includes(commentId); // all checks in one loop

    if (!isElementInViewport(commentElement) || isAlreadyMarkedComment) return;

    const sessionCreatedAt = currentSessionCreatedAt;
    await addComment(db, { threadId, commentId, sessionCreatedAt });

    // update sorted comments
    latestCommentUpdater.updateLatestComment(commentElement);
  });

  const { latestCommentId, latestCommentDate } = latestCommentUpdater.getLatestComment();

  // update thread bellow forEach
  await updateThread(db, {
    threadId,
    ...(latestCommentId && { latestCommentId }),
    ...(latestCommentDate && { latestCommentTimestamp: latestCommentDate.getTime() }),
  });
};

/** Used only for max elem for Thread.latestCommentId in db. */
const createLatestCommentUpdater = (initialCommentElement: HTMLElement) => {
  const initialCommentId = validateCommentElementIdOrThrow(initialCommentElement);

  let latestCommentId = initialCommentId;
  let latestCommentDate = getDateFromCommentId(initialCommentId);

  const updateLatestComment = (commentElement: HTMLElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    const currentDate = getDateFromCommentId(commentId);

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
  const threadIdFromDom = getThreadIdFromDom();

  const db = await openDatabase();
  const thread = await getThread(db, threadIdFromDom); // will throw

  return thread;
};

export const updateCommentsFromPreviousSessionOrCreateThread = async (
  debug = false
): Promise<void> => {
  let result = {};

  const threadIdFromDom = getThreadIdFromDom();

  const db = await openDatabase();
  const existingThread = await getThread(db, threadIdFromDom).catch((_error) =>
    logger.info(`First run, thread with threadIdFromDom:${threadIdFromDom} not found.`)
  );

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
    logger.info(message);

    result = {
      isExistingThread: true,
      thread: existingThread,
      updatedComments,
    };
  } else {
    // reduce db size here, before adding new thread
    // todo: fix this
    await limitIndexedDBSize(db);

    // add new thread if it doesn't exist
    const newThread = await addThread(db, {
      threadId: threadIdFromDom,
      updatedAt: new Date().getTime(), // first run creates session - comment.currentCreatedAt
    });

    if (!newThread)
      throw new MyCreateModelFailedDBException('Failed to create new Thread.');

    result = {
      isExistingThread: false,
      thread: newThread,
      updatedComments: [],
    };
  }

  if (debug) {
    logger.info('updateCommentsFromPreviousSessionOrCreateThread debug result:', result);

    const allDbData = await getAllDbData(db);
    logger.info('allDbData', allDbData);
  }
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

const createCurrentIndexUpdater = () => {
  // state
  let currentIndex = 0;

  const getCurrentIndex = () => currentIndex;

  const setCurrentIndex = (value: number) => {
    currentIndex = value;
  };

  return {
    getCurrentIndex,
    setCurrentIndex,
  };
};

/** Use only this instance. */
export const currentIndex = createCurrentIndexUpdater();

export const scrollNextCommentIntoView = async (scrollToFirstComment = false) => {
  const db = await openDatabase();
  const settingsData = await getSettings(db);

  const highlightedCommentsSelector = `.${highlightedCommentClass}`;
  const highlightedCommentsByDateSelector = `.${highlightedCommentByDateClass}`;

  const commentsSelectorMap = {
    unread: highlightedCommentsSelector,
    'by-date': highlightedCommentsByDateSelector,
    both: `${highlightedCommentsSelector}, ${highlightedCommentsByDateSelector}`,
  };
  const chosenCommentsSelector = commentsSelectorMap[settingsData.scrollTo];

  const commentElements = document.querySelectorAll<HTMLElement>(chosenCommentsSelector);

  if (!(commentElements.length > 0)) return;

  let commentElement: HTMLElement;
  if (scrollToFirstComment) {
    const firstCommentElement = document.querySelector<HTMLElement>(commentSelector);
    if (!firstCommentElement) return;

    commentElement = firstCommentElement;
    currentIndex.setCurrentIndex(0);
  } else {
    // find currentIndex for first element that is not in viewport
    for (
      let index = currentIndex.getCurrentIndex();
      index < commentElements.length;
      index++
    ) {
      if (!isElementInViewport(commentElements[index])) {
        currentIndex.setCurrentIndex(index);
        break;
      }

      // last iteration
      if (index > commentElements.length - 2) {
        currentIndex.setCurrentIndex(0);
      }
    }

    commentElement = commentElements[currentIndex.getCurrentIndex()];
  }

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
};

/** onScroll - markAsRead, highlight */
export const handleScrollDom = async () => {
  // disable handlers too, and not attaching only
  if (!isActiveTab()) return;

  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  if (!(commentElements.length > 0)) return;

  try {
    await delayExecution(markAsRead, markAsReadDelay, commentElements); // always delay

    await highlight(commentElements);
    await highlightByDateWithSettingsData(commentElements);
  } catch (error) {
    logger.error('Error handling comments onScroll:', error);
  }
};

/** updateCommentsFromPreviousSession, highlight */
export const handleUrlChangeDom = async () => {
  if (!isActiveTab()) return;

  // await clickSortByNewMenuItem();

  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  // only root check, child functions must have commentElements array filled
  if (!(commentElements.length > 0)) return;

  try {
    await updateCommentsFromPreviousSessionOrCreateThread();
    await highlight(commentElements);

    // completely independent from db highlighting, can run in parallel
    await highlightByDateWithSettingsData(commentElements);
  } catch (error) {
    logger.error('Error handling comments onUrlChange:', error);
  }
};
