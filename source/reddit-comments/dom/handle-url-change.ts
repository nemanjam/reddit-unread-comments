import { waitAfterSortByNew } from '../constants/config';
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
  wait,
} from '../utils';
import logger from '../logger';

/** updateCommentsFromPreviousSession, highlight */
export const handleUrlChangeDom = async () => {
  if (!isActiveTabAndRedditThread()) return;

  try {
    const db = await openDatabase();
    const { sortAllByNew } = await getSettings(db);
    if (sortAllByNew) {
      const hasSorted = await clickSortByNewMenuItem();
      if (hasSorted) {
        // delay must be AFTER sort
        await wait(waitAfterSortByNew);
      }
    }
    //! important, must select element AFTER sort
    // only root check, child functions must have commentElements array filled
    const { isOk, commentElements } = isActiveTabAndRedditThreadAndHasComments();
    if (!isOk) return;

    await updateCommentsFromPreviousSessionOrCreateThread();
    await highlightByRead(commentElements);

    // completely independent from db highlighting, can run in parallel
    await highlightByDate(commentElements);
  } catch (error) {
    logger.error('Error handling comments onUrlChange:', error);
  }
};
