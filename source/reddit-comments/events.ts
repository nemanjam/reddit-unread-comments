import { browser } from 'webextension-polyfill-ts';

import {
  debounce,
  hasArrivedToRedditThread,
  hasLeftRedditThread,
  isActiveTab,
} from './utils';
import {
  getScrollElement,
  handleScrollDom,
  handleUrlChangeDom,
  scrollNextCommentIntoView,
} from './dom';
import { scrollDebounceWait, urlChangeDebounceWait } from './constants';
import { truncateDatabase } from './database/limit-size';
import { messageTypes, MyMessageType } from './message';
import { radioAndSliderToDate } from './datetime';

/**------------------------------------------------------------------------
 *                           onUrlChange ->  onScroll
 *------------------------------------------------------------------------**/

/*------------------------------- onKeyDown -----------------------------*/

const handleCtrlSpaceKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.code === 'Space') scrollNextCommentIntoView();

  if (event.ctrlKey && event.shiftKey && event.code === 'Space')
    scrollNextCommentIntoView(true);
};

/*-------------------------------- onScroll ------------------------------*/

const handleScroll = () => handleScrollDom();
const debouncedScrollHandler = debounce(handleScroll, scrollDebounceWait);

const handleUrlChange = async (previousUrl: string, currentUrl: string) => {
  // modal or document
  const scrollElement = getScrollElement();

  if (hasArrivedToRedditThread(previousUrl, currentUrl)) {
    scrollElement.addEventListener('scroll', debouncedScrollHandler);

    // listen keys on document
    document.addEventListener('keydown', handleCtrlSpaceKeyDown);

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
  const currentUrl = location.href;

  if (currentUrl !== previousUrl) {
    previousUrl = currentUrl;

    // run on all pages to attach and detach scroll listeners
    await debouncedUrlChangeHandler(previousUrlCopy, currentUrl);
  }
});

const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};

// alert('global');

export const attachAllEventHandlers = async () => {
  if (!isActiveTab()) return;

  // await truncateDatabase();

  onUrlChange();
};

/*-------------------------- Listen to messages in contentScript ------------------------*/

browser.runtime.onMessage.addListener((message: MyMessageType) => {
  console.log('Content script received message:', message);

  const { type, payload } = message;

  switch (type) {
    case messageTypes.HIGHLIGHT_ON_TIME:
      const dateInPast = radioAndSliderToDate(payload);
      // trigger url change with arg

      break;

    default:
      break;
  }
});
