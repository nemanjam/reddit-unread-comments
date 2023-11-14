import { debounce, hasArrivedToRedditThread, hasLeftRedditThread } from './utils';
import { getScrollElement, traverseComments } from './dom';
import { scrollDebounceWait, domReadyDebounceWait } from './constants';

/**------------------------------------------------------------------------
 *                           onUrlChange ->  onScroll
 *------------------------------------------------------------------------**/

/*-------------------------------- onScroll ------------------------------*/

const handleScroll = () => traverseComments('onScroll');
const debouncedScrollHandler = debounce(handleScroll, scrollDebounceWait);

const handleUrlChange = async (previousUrl: string, currentUrl: string) => {
  // modal or document
  const scrollElement = getScrollElement();

  if (hasArrivedToRedditThread(previousUrl, currentUrl)) {
    scrollElement.addEventListener('scroll', debouncedScrollHandler);

    // test onUrlChange and onScroll independently
    await traverseComments('onUrlChange');
  }

  if (hasLeftRedditThread(previousUrl, currentUrl)) {
    scrollElement.removeEventListener('scroll', debouncedScrollHandler);
  }
};

// must wait for redirect and page content load
const debouncedUrlChangeHandler = debounce(handleUrlChange, domReadyDebounceWait);

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

export const attachAllEventHandlers = () => {
  onUrlChange();
};
