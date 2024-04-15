import { markAsReadDelay, waitAfterSortByNew } from '../constants/config';
import { commentSelector } from '../constants/selectors';
import { getSettings } from '../database/models/settings';
import { openDatabase } from '../database/schema';
import { highlightByDateWithSettingsData } from '../dom/highlight-by-date';
import {
  highlightByRead,
  updateCommentsFromPreviousSessionOrCreateThread,
} from '../dom/highlight-by-read';
import { clickSortByNewMenuItem } from '../dom/sort-by-new';
import { isActiveTabAndRedditThread, wait } from '../utils';
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
    const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
    // only root check, child functions must have commentElements array filled
    if (!(commentElements.length > 0)) return;

    await updateCommentsFromPreviousSessionOrCreateThread();
    await highlightByRead(commentElements);

    // completely independent from db highlighting, can run in parallel
    await highlightByDateWithSettingsData(commentElements);
  } catch (error) {
    logger.error('Error handling comments onUrlChange:', error);
  }
};
