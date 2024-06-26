/*---------------------- Listen to messages in contentScript --------------------*/

import browser, { Runtime } from 'webextension-polyfill';
import { waitAfterSortByNew } from '../constants/config';
import {
  deleteAllThreadsWithComments,
  deleteThreadWithComments,
} from '../database/limit-size';
import {
  defaultValues,
  getSettings,
  resetSettings,
  updateSettings,
} from '../database/models/settings';
import { markCommentsAsReadInCurrentSessionForThread } from '../database/models/thread';
import { openDatabase, SettingsData, SettingsDataKeys } from '../database/schema';
import { highlightByDate } from '../dom/highlight-by-date';
import {
  highlightByRead,
  updateCommentsFromPreviousSessionOrCreateThread,
} from '../dom/highlight-by-read';
import {
  calcHighlightedByDateCount,
  calcHighlightedUnreadCount,
  getAllComments,
  getAllCommentsIds,
  removeHighlightByDateClass,
  removeHighlightClass,
  removeHighlightReadClass,
} from '../dom/highlight-common';
import { currentIndex } from '../dom/scroll-to-comment';
import { clickSortByNewMenuItem } from '../dom/sort-by-new';
import { getThreadIdFromDom } from '../dom/thread';
import logger from '../logger';
import { messageTypes, MyMessageType } from '../message';
import { detectChanges, wait } from '../utils';

export const formSectionsKeys = {
  sectionTime: ['isHighlightOnTime', 'timeSlider', 'timeScale'],
  sectionUnread: ['isHighlightUnread', 'unHighlightOn', 'markAllAsRead'],
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
        const previousSettingsDbData = await getSettings(db);
        await updateSettings(db, settingsData);

        // enhance with props that aren't in db, but only default values
        const { markAllAsRead } = defaultValues;
        const previousSettingsData = { ...previousSettingsDbData, markAllAsRead };

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
              await highlightByDate(commentElements);
            } else {
              // if not un-highlight
              removeHighlightByDateClass();
            }
            break;
          }

          // un-highlight on-scroll or url change
          case changedSections.includes('sectionUnread'): {
            const { unHighlightOn, isHighlightUnread, markAllAsRead } = settingsData;

            if (changedKeys.includes('isHighlightUnread')) {
              if (isHighlightUnread === true) {
                const commentElements = getAllComments();
                await highlightByRead(commentElements);
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
                await highlightByRead(commentElements);
                break;
            }

            if (changedKeys.includes('markAllAsRead')) {
              if (markAllAsRead === true) {
                const commentIds = getAllCommentsIds();
                const threadIdFromDom = getThreadIdFromDom();
                await markCommentsAsReadInCurrentSessionForThread(
                  db,
                  threadIdFromDom,
                  commentIds
                );
                const commentElements = getAllComments();
                await highlightByRead(commentElements);
              }
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
                await highlightByDate(commentElements);
                await highlightByRead(commentElements);
              }
            }
            break;

          case changedSections.includes('sectionLogger'):
            await logger.resetInstance();
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
        await highlightByRead(commentElements);
        break;
      }

      case messageTypes.RESET_THREAD_DATA: {
        const threadIdFromDom = getThreadIdFromDom();

        const db = await openDatabase();
        await deleteThreadWithComments(db, threadIdFromDom);

        // reset current thread
        await updateCommentsFromPreviousSessionOrCreateThread();
        const commentElements = getAllComments();
        await highlightByRead(commentElements);
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

      case messageTypes.GET_PAGE_URL: {
        const response: MyMessageType = {
          type: messageTypes.GET_PAGE_URL,
          payload: location.href,
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

export const onReceiveMessage = () => {
  browser.runtime.onMessage.addListener(handleMessageFromPopup);
};
