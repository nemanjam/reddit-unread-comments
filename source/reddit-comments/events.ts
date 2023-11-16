import {
  debounce,
  hasArrivedToRedditThread,
  hasLeftRedditThread,
  isActiveTab,
} from './utils';
import { getScrollElement, handleScrollDom, handleUrlChangeDom } from './dom';
import { scrollDebounceWait, urlChangeDebounceWait } from './constants';
import { truncateDatabase } from './database';

/**------------------------------------------------------------------------
 *                           onUrlChange ->  onScroll
 *------------------------------------------------------------------------**/

/*-------------------------------- onScroll ------------------------------*/

const handleScroll = () => handleScrollDom();
const debouncedScrollHandler = debounce(handleScroll, scrollDebounceWait);

const handleUrlChange = async (previousUrl: string, currentUrl: string) => {
  // modal or document
  const scrollElement = getScrollElement();

  if (hasArrivedToRedditThread(previousUrl, currentUrl)) {
    scrollElement.addEventListener('scroll', debouncedScrollHandler);

    // test onUrlChange and onScroll independently
    await handleUrlChangeDom();
  }

  if (hasLeftRedditThread(previousUrl, currentUrl)) {
    scrollElement.removeEventListener('scroll', debouncedScrollHandler);
  }
};

// must wait for redirect and page content load
const debouncedUrlChangeHandler = debounce(handleUrlChange, urlChangeDebounceWait);

/*-------------------------------- onUrlChange ------------------------------*/

let previousUrl = '';
const observer = new MutationObserver(async () => {
  // string is primitive type, create backup
  const previousUrlCopy = previousUrl;

  if (location.href !== previousUrl) {
    previousUrl = location.href;

    // run on all pages to attach and detach scroll listeners
    await debouncedUrlChangeHandler(previousUrlCopy, location.href);
  }
});

const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};

// alert('global');

export const attachAllEventHandlers = async () => {
  if (!isActiveTab()) return;

  await truncateDatabase();

  onUrlChange();
};
