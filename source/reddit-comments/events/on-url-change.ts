import { urlObserveDebounceWait, waitForLocationHrefToUpdate } from '../constants/config';
import {
  debounce,
  hasArrivedToRedditThread,
  hasLeftRedditThread,
  MeasureTime,
  wait,
} from '../utils';
import { dispatchArrivedToRedditThreadEvent } from './on-thread';

/*-------------------------------- onUrlChange ------------------------------*/

const handleUrlChange = (previousUrl: string, currentUrl: string) => {
  const hasArrived = hasArrivedToRedditThread(previousUrl, currentUrl);

  const hasLeft = hasLeftRedditThread(previousUrl, currentUrl);
  console.log('hasArrived', hasArrived, 'hasLeft', hasLeft);

  MeasureTime.setStartTime(performance.now());

  if (hasArrived) {
    dispatchArrivedToRedditThreadEvent();
  }
};

let previousUrl = '';
const observerCallback = async () => {
  // string is primitive type, create backup
  const previousUrlCopy = previousUrl;

  //! important: must wait for location.href to update
  await wait(waitForLocationHrefToUpdate);
  const currentUrl = location.href;

  if (currentUrl !== previousUrl) {
    previousUrl = currentUrl;

    console.log('previousUrlCopy', previousUrlCopy);

    // run on all pages to attach and detach scroll listeners
    handleUrlChange(previousUrlCopy, currentUrl);
  }
};

const debouncedObserverCallback = debounce(observerCallback, urlObserveDebounceWait);

const observer = new MutationObserver(debouncedObserverCallback);

export const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};
