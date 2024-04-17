import { urlChangeDebounceWait } from '../constants/config';
import { handleUrlChangeDom } from '../dom/handle-url-change';
import { debounce, hasArrivedToRedditThread, hasLeftRedditThread } from '../utils';
import { handleCtrlSpaceKeyDown } from './on-key-down';
import { debouncedScrollHandler } from './on-scroll,';

/*-------------------------------- onUrlChange ------------------------------*/

const handleUrlChange = async (previousUrl: string, currentUrl: string) => {
  if (hasArrivedToRedditThread(previousUrl, currentUrl)) {
    document.addEventListener('scroll', debouncedScrollHandler);

    // listen keys on document
    document.addEventListener('keydown', handleCtrlSpaceKeyDown);

    // test onUrlChange and onScroll independently
    await handleUrlChangeDom();
  }

  if (hasLeftRedditThread(previousUrl, currentUrl)) {
    document.removeEventListener('scroll', debouncedScrollHandler);
  }
};

// must wait for redirect and page content load
const debouncedUrlChangeHandler = debounce(handleUrlChange, urlChangeDebounceWait);

let previousUrl = '';
const observer = new MutationObserver(async () => {
  // string is primitive type, create backup
  const previousUrlCopy = previousUrl;
  const currentUrl = location.href;

  if (currentUrl !== previousUrl) {
    previousUrl = currentUrl;

    // run on all pages to attach and detach scroll listeners
    await debouncedUrlChangeHandler(previousUrlCopy, currentUrl);
  }
});

export const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};
