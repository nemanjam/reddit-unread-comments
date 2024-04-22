import {
  currentSessionCreatedAt,
  highlightedCommentClass,
  highlightedCommentReadClass,
} from '../constants/config';
import { limitIndexedDBSize } from '../database/limit-size';
import { addComment } from '../database/models/comment';
import { getSettings } from '../database/models/settings';
import {
  addThread,
  getAllCommentsForThread,
  getCommentsForThreadForCurrentSession,
  getCommentsForThreadWithoutCurrentSession,
  getThread,
  updateCommentsSessionCreatedAtForThread,
  updateThread,
} from '../database/models/thread';
import { openDatabase, ThreadData } from '../database/schema';
import { MyCreateModelFailedDBException } from '../exceptions';
import logger from '../logger';
import { isActiveTabAndRedditThread } from '../utils';
import { validateCommentElementIdOrThrow } from '../validation';
import {
  addClass,
  getCommentContentElement,
  isElementInViewport,
  removeClass,
} from './highlight-common';
import { getThreadIdFromDom } from './thread';
import { getDateFromCommentId } from './timestamp';

/**
 * if session:
 * onUrlChange - creates session
 * onScroll - doesn't create session
 */
export const highlightByRead = async (commentElements: NodeListOf<HTMLElement>) => {
  const db = await openDatabase();
  const threadIdFromDom = getThreadIdFromDom();

  const { unHighlightOn, isHighlightUnread } = await getSettings(db);
  // highlighting disabled
  if (!isHighlightUnread) return;

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
    const commentId = validateCommentElementIdOrThrow(commentElement);
    // disjunction between all comments and read comments in db
    const isReadCommentPreviousSessions =
      readCommentsPreviousSessionsIds.includes(commentId);
    const isReadCommentCurrentSession = readCommentsCurrentSessionIds.includes(commentId);

    if (isReadCommentPreviousSessions) return;

    // state must come from db, never from dom

    if (unHighlightOn === 'on-scroll') {
      // highlighting
      if (!isReadCommentCurrentSession) {
        // remove highlight read if exists
        removeClass(commentElement, highlightedCommentReadClass);
        addClass(commentElement, highlightedCommentClass);
      }

      // un-highlighting
      if (isReadCommentCurrentSession) {
        removeClass(commentElement, highlightedCommentClass);
        // highlighting read
        addClass(commentElement, highlightedCommentReadClass);
      }
    }

    if (unHighlightOn === 'on-url-change') {
      // highlighting
      if (!isReadCommentCurrentSession) {
        addClass(commentElement, highlightedCommentClass);
      }

      // un-highlighting
      // remove unconditionally
      removeClass(commentElement, highlightedCommentReadClass);
    }
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

/** Mutates only database, no live DOM updates. */
export const markAsRead = async (
  commentElements: NodeListOf<HTMLElement>
): Promise<void> => {
  // because of delay
  if (!isActiveTabAndRedditThread()) return;

  const db = await openDatabase();

  const { isHighlightUnread } = await getSettings(db);
  // marking disabled
  if (!isHighlightUnread) return;

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

    // since comments are now nested, select only content of the comment
    const commentContentElement = getCommentContentElement(commentElement);
    if (!commentContentElement) return;

    const isInViewport = isElementInViewport(commentContentElement);

    if (commentId === 't1_l0qyzpu') {
      console.log(
        'commentId:',
        commentId,
        'isInViewport',
        isInViewport,
        'commentContentElement',
        commentContentElement
      );
    }

    if (!isInViewport || isAlreadyMarkedComment) return;

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
    ...(latestCommentDate && {
      latestCommentTimestamp: latestCommentDate.getTime(),
    }),
  });
};

export const updateCommentsFromPreviousSessionOrCreateThread =
  async (): Promise<void> => {
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
      // new thread detected

      // reduce db size here, before adding new thread
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

    logger.info('updateCommentsFromPreviousSessionOrCreateThread debug result:', result);
  };
