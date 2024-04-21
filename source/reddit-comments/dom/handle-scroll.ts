import { markAsReadDelay } from '../constants/config';
import { highlightByDate } from '../dom/highlight-by-date';
import { highlightByRead, markAsRead } from '../dom/highlight-by-read';
import {
  delayExecution,
  isActiveTabAndRedditThread,
  isActiveTabAndRedditThreadAndHasComments,
} from '../utils';
import logger from '../logger';

/** onScroll - markAsRead, highlight */
export const handleScrollDom = async () => {
  // disable handlers too, and not attaching only
  const { isOk, commentElements } = isActiveTabAndRedditThreadAndHasComments();
  if (!isOk) return;

  try {
    // independent of comments in database, comes first
    //! scroll fires with scrollDebounceWait = 1000 before urlChange 2 seconds, and overlayId is not found, try to fix
    await highlightByDate(commentElements);

    await delayExecution(markAsRead, markAsReadDelay, commentElements); // always delay
    // check after delay again
    if (!isActiveTabAndRedditThread()) return;

    await highlightByRead(commentElements);
  } catch (error) {
    logger.error('Error handling comments onScroll:', error);
  }
};
