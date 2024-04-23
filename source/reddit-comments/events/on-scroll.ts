import { markAsReadDelay, scrollDebounceWait } from '../constants/config';
import { debounceTrailing, isActiveTabAndRedditThread, wait } from '../utils';
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
    await markAsRead(commentElements); // un-highlights immediately, sets to 2e12
    await wait(markAsReadDelay);
    if (!isActiveTabAndRedditThread()) return;

    await highlightByRead(commentElements);
  } catch (error) {
    logger.error('Error handling comments handleScroll:', error);
  }
};

//! must use debounceTrailing for isInViewport last bottom comment
export const debouncedScrollHandler = debounceTrailing(handleScroll, scrollDebounceWait);
