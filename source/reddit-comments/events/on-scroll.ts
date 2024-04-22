import { markAsReadDelay, scrollDebounceWait } from '../constants/config';
import { debounce, isActiveTabAndRedditThread, wait } from '../utils';
import { highlightByDate } from '../dom/highlight-by-date';
import { highlightByRead, markAsRead } from '../dom/highlight-by-read';
import { isActiveTabAndRedditThreadAndHasComments } from '../utils';
import logger from '../logger';

/*-------------------------------- onScroll ------------------------------*/

/** highlight, markAsRead */
export const handleScroll = async () => {
  // checks active tab and reddit thread too
  const { isOk, commentElements } = isActiveTabAndRedditThreadAndHasComments();
  if (!isOk) return;

  try {
    // without db
    await highlightByDate(commentElements);

    // with db
    await markAsRead(commentElements); // for next session
    await wait(markAsReadDelay);
    if (!isActiveTabAndRedditThread()) return;

    await highlightByRead(commentElements);
  } catch (error) {
    logger.error('Error handling comments handleScroll:', error);
  }
};

export const debouncedScrollHandler = debounce(handleScroll, scrollDebounceWait);
