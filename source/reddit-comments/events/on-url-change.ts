import { urlObserveDebounceWait, waitForLocationHrefToUpdate } from '../constants/config';
import { debounce, hasArrivedToRedditThread, wait } from '../utils';
import { dispatchArrivedToRedditThreadEvent } from './on-thread';

/*-------------------------------- onUrlChange ------------------------------*/

const handleUrlChange = (previousUrl: string, currentUrl: string) => {
  const hasArrived = hasArrivedToRedditThread(previousUrl, currentUrl);

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

    handleUrlChange(previousUrlCopy, currentUrl);
  }
};

const debouncedObserverCallback = debounce(observerCallback, urlObserveDebounceWait);

const observer = new MutationObserver(debouncedObserverCallback);

export const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};
