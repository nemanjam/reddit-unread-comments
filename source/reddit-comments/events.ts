import { redditThreadRegex } from './constants';
import { debounce, highlight } from './utils';
import { debounceWait } from './constants';

// onScroll

const handleScroll = () => highlight();
const debouncedScrollHandler = debounce(handleScroll, debounceWait);

// onDOMReady

const handleDOMReady = () => {
  const currentUrl = location.href;
  const isRedditThread = currentUrl.match(redditThreadRegex) !== null;

  // attach/detach onScroll
  if (isRedditThread) {
    // alert('attach scrollHandler');
    document.addEventListener('scroll', debouncedScrollHandler);
    highlight();
  } else {
    document.removeEventListener('scroll', debouncedScrollHandler);
  }
};

const debouncedDOMReadyHandler = debounce(handleDOMReady, debounceWait);

const onDOMReady = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debouncedDOMReadyHandler);
  } else {
    debouncedDOMReadyHandler();
  }
};

// onUrlChange

let previousUrl = '';
const observer = new MutationObserver(() => {
  if (location.href !== previousUrl) {
    previousUrl = location.href;
    onDOMReady();
  }
});

const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};

// onUrlChange -> onDOMReady -> onScroll

export const attachAllEventHandlers = () => onUrlChange();
