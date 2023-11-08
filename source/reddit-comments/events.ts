import { redditThreadRegex } from './constants';
import { debounce, highlight } from './utils';
import { debounceWait } from './constants';

// onScroll

const handleScroll = () =>  highlight();
const debouncedScrollHandler = debounce(handleScroll, debounceWait);

// onUrlChange

const handleLocationChange = () => {

    const currentUrl = location.href;
    const isRedditThread = currentUrl.match(redditThreadRegex) !== null;
  
    // attach/detach onScroll
    if(isRedditThread) {
      document.addEventListener('scroll', debouncedScrollHandler);
      // highlight onUrlChange
      highlight();
    }
    else {
      document.removeEventListener('scroll', debouncedScrollHandler);
    }
  
  }

const debouncedLocationChangeHandler = debounce(handleLocationChange, debounceWait);

let previousUrl = '';
const observer = new MutationObserver(() => {
  if (location.href !== previousUrl) {
      previousUrl = location.href;
      debouncedLocationChangeHandler()
    }
});


const onUrlChange = () => { 
    observer.observe(document, {subtree: true, childList: true});
    document.addEventListener('beforeunload', () => observer.disconnect());
}

// onDOMReady

const onDOMReady = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => onUrlChange());
    } else {
      onUrlChange();
    }
}
  
export const attachAllEventHandlers = () => onDOMReady();
 
  