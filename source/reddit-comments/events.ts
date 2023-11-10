import { debounce, isRedditThread } from './utils';
import { highlight } from './dom';
import { scrollDebounceWait, domReadyDebounceWait } from './constants';

/**------------------------------------------------------------------------
 *                           onUrlChange ->  onScroll
 *------------------------------------------------------------------------**/

/*-------------------------------- onScroll ------------------------------*/

const handleScroll = () => {
  alert('handleScroll');
  highlight();
};
const debouncedScrollHandler = debounce(handleScroll, scrollDebounceWait);

const handleUrlChange = () => {
  if (isRedditThread()) {
    alert(`attach scroll handler`);
    // detect modal

    // test onUrlChange and onScroll independently
    document.addEventListener('scroll', debouncedScrollHandler);
    // highlight();
  } else {
    // alert('DETACH scroll handler');
    document.removeEventListener('scroll', debouncedScrollHandler);
  }
};

// must wait for redirect and page content load
const debouncedUrlChangeHandler = debounce(handleUrlChange, domReadyDebounceWait);

/*-------------------------------- onUrlChange ------------------------------*/

let previousUrl = '';
const observer = new MutationObserver(() => {
  if (location.href !== previousUrl) {
    previousUrl = location.href;

    // run on all pages to attach and detach scroll listeners
    debouncedUrlChangeHandler();
  }
});

const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};

export const attachAllEventHandlers = () => {
  onUrlChange();
};
