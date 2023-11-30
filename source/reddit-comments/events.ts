import browser, { Runtime } from 'webextension-polyfill';

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
  highlightByDateWithSettingsData,
  scrollNextCommentIntoView,
} from './dom';
import { commentSelector, scrollDebounceWait, urlChangeDebounceWait } from './constants';
import { truncateDatabase } from './database/limit-size';
import { messageTypes, MyMessageType } from './message';
import { openDatabase } from './database/schema';
import { getSettings } from './database/models/settings';

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

/** Entry point. */
export const attachAllEventHandlers = async () => {
  if (!isActiveTab()) return;

  // create database
  const db = await openDatabase();

  // await truncateDatabase();

  onUrlChange();
};

/*---------------------- Listen to messages in contentScript --------------------*/

const handleMessageFromPopup = async (
  request: MyMessageType,
  sender: Runtime.MessageSender,
  sendResponse: (response?: any) => void
): Promise<any> => {
  console.log('Content script received message:', request);

  // payload is only useful for what is changed, data is already in db
  const { type, payload } = request;

  // todo: wrap with try catch
  switch (type) {
    case messageTypes.GET_SETTINGS_DATA_FROM_DB:
      const db = await openDatabase();
      const settings = await getSettings(db);

      const response: MyMessageType = {
        type: messageTypes.GET_SETTINGS_DATA_FROM_DB,
        payload: settings,
      };

      sendResponse(response); // this doesn't
      return response; // this works
      break;

    case messageTypes.HIGHLIGHT_ON_TIME:
      const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
      if (!(commentElements.length > 0)) return;

      highlightByDateWithSettingsData(commentElements);
      break;

    case messageTypes.EXAMPLE:
      // send back data to popup
      sendResponse({ type: 'databaseInitialized' });

      return true;
      break;

    default:
      break;
  }
};

browser.runtime.onMessage.addListener(handleMessageFromPopup);
