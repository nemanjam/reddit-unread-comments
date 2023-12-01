import browser, { Runtime } from 'webextension-polyfill';

import {
  debounce,
  detectChanges,
  hasArrivedToRedditThread,
  hasLeftRedditThread,
  isActiveTab,
} from './utils';
import {
  getScrollElement,
  getThreadIdFromDom,
  handleScrollDom,
  handleUrlChangeDom,
  highlightByDateWithSettingsData,
  scrollNextCommentIntoView,
} from './dom';
import { commentSelector, scrollDebounceWait, urlChangeDebounceWait } from './constants';
import {
  deleteAllThreadsWithComments,
  deleteThreadWithComments,
  getAllDbData,
  truncateDatabase,
} from './database/limit-size';
import { messageTypes, MyMessageType } from './message';
import { openDatabase, SettingsDataKeys } from './database/schema';
import { getSettings, resetSettings, updateSettings } from './database/models/settings';

/**------------------------------------------------------------------------
 *                           onUrlChange ->  onScroll
 *------------------------------------------------------------------------**/

/*------------------------------- onKeyDown -----------------------------*/

const handleCtrlSpaceKeyDown = async (event: KeyboardEvent) => {
  // ctrl + shift + space -> scroll to first
  if (event.ctrlKey && event.shiftKey && event.code === 'Space') {
    await scrollNextCommentIntoView(true);
    return;
  }

  if (event.ctrlKey && event.code === 'Space') await scrollNextCommentIntoView();
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

/*---------------------- Listen to messages in contentScript --------------------*/

export const formSectionsKeys = {
  sectionTime: ['isHighlightOnTime', 'timeSlider', 'timeScale'],
  sectionUnHighlight: ['unHighlightOn'],
  sectionScroll: ['scrollTo'],
  sectionSort: ['sortAllByNew'],
} as const;

export type formSectionsKeysType = keyof typeof formSectionsKeys;

const handleMessageFromPopup = async (
  request: MyMessageType,
  _sender: Runtime.MessageSender,
  /** deprecated, just return */
  _sendResponse: (response?: any) => void
): Promise<any> => {
  console.log('Content script received message:', request);

  const { type, payload } = request;

  try {
    switch (type) {
      case messageTypes.GET_SETTINGS_DATA_FROM_DB: {
        const db = await openDatabase();
        const settingsData = await getSettings(db);

        const response: MyMessageType = {
          type: messageTypes.GET_SETTINGS_DATA_FROM_DB,
          payload: settingsData,
        };

        return response; // return is a new way
      }

      case messageTypes.SUBMIT_SETTINGS_DATA: {
        const settingsData = payload;

        const db = await openDatabase();
        // only correct place to get prev settings
        const previousSettingsData = await getSettings(db);
        await updateSettings(db, settingsData);

        const changedKeys = detectChanges(previousSettingsData, settingsData);

        const changedSections = Object.entries(formSectionsKeys)
          .filter(([_section, sectionKeys]) =>
            sectionKeys.some((key: SettingsDataKeys) => changedKeys.includes(key))
          )
          .map(([section]) => section);

        // handle all form sections
        // can return response only once, all return void
        switch (true) {
          case changedSections.includes('sectionTime'):
            const commentElements =
              document.querySelectorAll<HTMLElement>(commentSelector);
            if (!(commentElements.length > 0)) return;

            // highlight on form change
            await highlightByDateWithSettingsData(commentElements);
            break;

          // nothing, settings db is updated already
          case changedSections.includes('sectionUnHighlight'):
            break;
          case changedSections.includes('sectionScroll'):
            break;
          case changedSections.includes('sectionSort'):
            break;

          default:
            break;
        }

        break; // no need for response
      }

      case messageTypes.RESET_SETTINGS_DATA: {
        const db = await openDatabase();
        await resetSettings(db);
        break;
      }

      case messageTypes.RESET_ALL_THREADS_DATA: {
        const db = await openDatabase();
        await deleteAllThreadsWithComments(db);
        break;
      }

      case messageTypes.RESET_THREAD_DATA: {
        const threadIdFromDom = getThreadIdFromDom();

        const db = await openDatabase();
        deleteThreadWithComments(db, threadIdFromDom);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`Error handling a message: ${type}.`, request);
  }

  // default no response
  return;
};

const onReceiveMessage = () => {
  browser.runtime.onMessage.addListener(handleMessageFromPopup);
};

/*-------------------------------- Entry point ------------------------------*/

export const attachAllEventHandlers = async () => {
  if (!isActiveTab()) return;

  // create database
  const db = await openDatabase();

  // await truncateDatabase();

  onReceiveMessage();
  onUrlChange();
};
