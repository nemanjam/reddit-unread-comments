import { debounce, isRedditThread } from './utils';
import { highlight } from './dom';
import {
  scrollDebounceWait,
  domReadyDebounceWait,
  modalScrollContainerSelector,
} from './constants';

/**------------------------------------------------------------------------
 *                           onUrlChange ->  onScroll
 *------------------------------------------------------------------------**/

/*-------------------------------- onScroll ------------------------------*/

const handleScroll = () => highlight();
const debouncedScrollHandler = debounce(handleScroll, scrollDebounceWait);

const handleUrlChange = () => {
  // detect modal
  const modalScrollContainer = document.querySelector<HTMLElement>(
    modalScrollContainerSelector
  );
  const scrollElement = modalScrollContainer ?? document;

  if (isRedditThread()) {
    scrollElement.addEventListener('scroll', debouncedScrollHandler);
    // test onUrlChange and onScroll independently
    highlight();
  } else {
    scrollElement.removeEventListener('scroll', debouncedScrollHandler);
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
