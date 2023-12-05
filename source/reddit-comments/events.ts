import browser, { Runtime } from 'webextension-polyfill';

import {
  debounce,
  detectChanges,
  hasArrivedToRedditThread,
  hasLeftRedditThread,
  isActiveTab,
  wait,
} from './utils';
import {
  calcHighlightedByDateCount,
  calcHighlightedUnreadCount,
  clickSortByNewMenuItem,
  currentIndex,
  getAllComments,
  getScrollElement,
  getThreadIdFromDom,
  handleScrollDom,
  handleUrlChangeDom,
  highlight,
  highlightByDateWithSettingsData,
  removeHighlightByDateClass,
  removeHighlightClass,
  removeHighlightReadClass,
  scrollNextCommentIntoView,
  updateCommentsFromPreviousSessionOrCreateThread,
} from './dom';
import {
  scrollDebounceWait,
  urlChangeDebounceWait,
  waitAfterSortByNew,
} from './constants';
import {
  deleteAllThreadsWithComments,
  deleteThreadWithComments,
  getAllDbData,
  truncateDatabase,
} from './database/limit-size';
import { messageTypes, MyMessageType } from './message';
import { openDatabase, SettingsData, SettingsDataKeys } from './database/schema';
import {
  getSettings,
  initSettings,
  resetSettings,
  updateSettings,
} from './database/models/settings';
import logger from './logger';

/**------------------------------------------------------------------------
 *                           onUrlChange ->  onScroll
 *------------------------------------------------------------------------**/

/*------------------------------- onKeyDown -----------------------------*/

const handleCtrlSpaceKeyDown = async (event: KeyboardEvent) => {
  // ctrl + shift + space -> scroll to first
  if (event.ctrlKey && event.code === 'Space') {
    if (event.shiftKey) {
      await scrollNextCommentIntoView(true);
    } else {
      await scrollNextCommentIntoView();
    }
  }
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
  sectionUnread: ['isHighlightUnread', 'unHighlightOn'],
  sectionScroll: ['scrollTo'],
  sectionSort: ['sortAllByNew'],
  sectionLogger: ['enableLogger'],
} as const;

export type formSectionsKeysType = keyof typeof formSectionsKeys;

const handleMessageFromPopup = async (
  request: MyMessageType,
  _sender: Runtime.MessageSender,
  /** deprecated, just return */
  _sendResponse: (response?: any) => void
): Promise<any> => {
  logger.info('Content script received message:', request);

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
        const settingsData: SettingsData = payload;

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
        // redo operations so changes are visible immediately
        // can return response only once, all return void
        switch (true) {
          case changedSections.includes('sectionTime'): {
            const { isHighlightOnTime } = settingsData;

            // if highlight on date re-highlight onChange
            if (isHighlightOnTime) {
              const commentElements = getAllComments();

              // highlight on form change
              await highlightByDateWithSettingsData(commentElements);
            } else {
              // if not un-highlight
              removeHighlightByDateClass();
            }
            break;
          }

          // un-highlight on-scroll or url change
          case changedSections.includes('sectionUnread'): {
            const { unHighlightOn, isHighlightUnread } = settingsData;

            if (changedKeys.includes('isHighlightUnread')) {
              if (isHighlightUnread === true) {
                const commentElements = getAllComments();
                await highlight(commentElements);
              } else {
                // disable main highlight
                removeHighlightClass();
                removeHighlightReadClass();
              }
            }

            switch (unHighlightOn) {
              case 'on-url-change':
                removeHighlightReadClass();
                break;
              case 'on-scroll':
                const commentElements = getAllComments();
                await highlight(commentElements);
                break;
            }
            break;
          }

          // ctrl + space
          case changedSections.includes('sectionScroll'): {
            currentIndex.setCurrentIndex(0);
            break;
          }

          case changedSections.includes('sectionSort'):
            const { sortAllByNew } = settingsData;
            if (sortAllByNew) {
              const hasSorted = await clickSortByNewMenuItem();
              if (hasSorted) {
                await wait(waitAfterSortByNew);

                const commentElements = getAllComments();
                await highlightByDateWithSettingsData(commentElements);
                await highlight(commentElements);
              }
            }
            break;

          case changedSections.includes('sectionLogger'):
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

        // reset current thread
        await updateCommentsFromPreviousSessionOrCreateThread();
        const commentElements = getAllComments();
        await highlight(commentElements);
        break;
      }

      case messageTypes.RESET_THREAD_DATA: {
        const threadIdFromDom = getThreadIdFromDom();

        const db = await openDatabase();
        await deleteThreadWithComments(db, threadIdFromDom);

        // reset current thread
        await updateCommentsFromPreviousSessionOrCreateThread();
        const commentElements = getAllComments();
        await highlight(commentElements);
        break;
      }

      case messageTypes.CALC_HIGHLIGHTED_ON_TIME_COUNT: {
        const count = calcHighlightedByDateCount();
        const response: MyMessageType = {
          type: messageTypes.CALC_HIGHLIGHTED_ON_TIME_COUNT,
          payload: count,
        };

        return response;
      }

      case messageTypes.CALC_HIGHLIGHTED_UNREAD_COUNT: {
        const count = calcHighlightedUnreadCount();
        const response: MyMessageType = {
          type: messageTypes.CALC_HIGHLIGHTED_UNREAD_COUNT,
          payload: count,
        };

        return response;
      }

      default:
        break;
    }
  } catch (error) {
    logger.error(`Error handling a message: ${type}.`, request);
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

  // await truncateDatabase();

  // create database
  const db = await openDatabase();
  await initSettings(db);

  onReceiveMessage();
  onUrlChange();
};
