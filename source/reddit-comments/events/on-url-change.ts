import { urlChangeDebounceWait } from '../constants/config';
import { handleUrlChangeDom } from '../dom/handle-url-change';
import { debounce, hasArrivedToRedditThread, hasLeftRedditThread, wait } from '../utils';
import { handleCtrlSpaceKeyDown } from './on-key-down';
import { debouncedScrollHandler } from './on-scroll';

/*-------------------------------- onUrlChange ------------------------------*/

const handleUrlChange = async (previousUrl: string, currentUrl: string) => {
  const hasArrived = hasArrivedToRedditThread(previousUrl, currentUrl);
  const hasLeft = hasLeftRedditThread(previousUrl, currentUrl);

  console.log('hasArrived', hasArrived, 'hasLeft', hasLeft);

  if (hasArrived) {
    document.addEventListener('scroll', debouncedScrollHandler);

    // listen keys on document
    document.addEventListener('keydown', handleCtrlSpaceKeyDown);

    // test onUrlChange and onScroll independently
    await handleUrlChangeDom();
  }

  if (hasLeft) {
    document.removeEventListener('scroll', debouncedScrollHandler);
  }
};

// must wait for redirect and page content load
const debouncedUrlChangeHandler = debounce(handleUrlChange, urlChangeDebounceWait);

// ne treba, ovo moze, samo da se saceka location.href;
const getCurrentUrl = (): string => {
  const currentIndex = history.state?.['__@virtualstate/navigation/key']?.currentIndex;
  const currentUrl =
    history.state?.['__@virtualstate/navigation/key']?.entries[currentIndex]?.url;

  return currentUrl;
};

// let previousUrl = getCurrentUrl();

let previousUrl = '';
const observer = new MutationObserver(async () => {
  // string is primitive type, create backup
  const previousUrlCopy = previousUrl;

  //! important: must wait for location.href to update
  await wait(1000);
  const currentUrl = location.href;

  if (currentUrl !== previousUrl) {
    previousUrl = currentUrl;

    console.log('previousUrlCopy', previousUrlCopy);

    // run on all pages to attach and detach scroll listeners
    await debouncedUrlChangeHandler(previousUrlCopy, currentUrl);
  }
});

export const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};

// ovaj radi samo zato sto kasni malo
// setInterval(() => {
//   // const currentUrl = location.href;
//   const currentUrl = getCurrentUrl();

//   console.log('currentUrl', currentUrl);

//   // const hasArrived = hasArrivedToRedditThread(previousUrl, currentUrl);
//   // const hasLeft = hasLeftRedditThread(previousUrl, currentUrl);

//   // console.log('hasArrived', hasArrived, 'hasLeft', hasLeft);
// }, 2000);

// document.addEventListener('scroll', () => {
//   console.log('onScroll', Math.random());
// });
