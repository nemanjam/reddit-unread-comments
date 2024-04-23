import { threadArrivedDebounceWait } from '../constants/config';
import { debounceLeading } from '../utils';
import { getSettings } from '../database/models/settings';
import { openDatabase } from '../database/schema';
import { highlightByDate } from '../dom/highlight-by-date';
import {
  highlightByRead,
  updateCommentsFromPreviousSessionOrCreateThread,
} from '../dom/highlight-by-read';
import { clickSortByNewMenuItem } from '../dom/sort-by-new';
import {
  isActiveTabAndRedditThread,
  isActiveTabAndRedditThreadAndHasComments,
} from '../utils';
import logger from '../logger';
import { ARRIVED_TO_REDDIT_THREAD_EVENT_NAME } from '../constants/events';
import { retryAndWaitForCommentsToLoad } from '../dom/wait-for-comments';

/*-------------------------- onArrivedToRedditThread ------------------------*/

/** updateCommentsFromPreviousSession, highlight */
export const handleArrivedToRedditThread = async () => {
  if (!isActiveTabAndRedditThread()) return;

  try {
    const db = await openDatabase();
    const { sortAllByNew } = await getSettings(db);

    if (sortAllByNew) {
      // when comments are loaded, sort menu is loaded too
      const { isSuccess } = await retryAndWaitForCommentsToLoad();
      if (!isSuccess) return;

      await clickSortByNewMenuItem();
    }

    // wait for sorted comments to reload
    const { isSuccess } = await retryAndWaitForCommentsToLoad();
    if (!isSuccess) return;

    //! important, must select element AFTER sort
    const { isOk, commentElements } = isActiveTabAndRedditThreadAndHasComments();
    if (!isOk) return;

    await updateCommentsFromPreviousSessionOrCreateThread();
    await highlightByRead(commentElements);

    // completely independent from db highlighting, can run in parallel
    await highlightByDate(commentElements);
  } catch (error) {
    logger.error('Error handling comments handleArrivedToRedditThread:', error);
  }
};

// must use debounceLeading to avoid 2 sec delay
export const debouncedArrivedToRedditThreadHandler = debounceLeading(
  handleArrivedToRedditThread,
  threadArrivedDebounceWait
);

export const dispatchArrivedToRedditThreadEvent = () => {
  const event = new CustomEvent(ARRIVED_TO_REDDIT_THREAD_EVENT_NAME);
  document.dispatchEvent(event);
};
