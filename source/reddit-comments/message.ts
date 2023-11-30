import browser from 'webextension-polyfill';
import { SettingsData, SettingsDataKeys } from './database/schema';
import { detectChanges, pickShallow } from './utils';

export interface MyMessageType {
  type: MessageTypes;
  payload?: any;
}

export const messageTypes = {
  HIGHLIGHT_ON_TIME: 'HIGHLIGHT_ON_TIME',
  EXAMPLE: 'EXAMPLE',
  GET_SETTINGS_DATA_FROM_DB: 'GET_SETTINGS_DATA_FROM_DB',
} as const;

export type MessageTypes = (typeof messageTypes)[keyof typeof messageTypes];

export const sendMessageFromPopupToContentScript = async (
  message: MyMessageType
): Promise<any> => {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    if (activeTab?.id) {
      // response to popup from contentScript
      const response = await browser.tabs.sendMessage(activeTab.id, message);
      console.log('Response from content script:', response);
      return response;
    } else {
      console.error('No active tab found.');
    }
  } catch (error) {
    console.error('Error sending message to content script:', error);
  }
};

// all must run only on transitions
export const applyFormToDom = async (
  previousSettingsData: SettingsData,
  settingsData: SettingsData
) => {
  const changedKeys = detectChanges(previousSettingsData, settingsData);

  const sectionTimeKeys: SettingsDataKeys[] = [
    'isHighlightOnTime',
    'timeSlider',
    'timeScale',
  ];

  if (sectionTimeKeys.some((key) => changedKeys.includes(key))) {
    // update previousSettingsData
    const changedProps = pickShallow(settingsData, sectionTimeKeys);
    previousSettingsData = { ...previousSettingsData, ...changedProps };

    sendMessageFromPopupToContentScript({
      type: messageTypes.HIGHLIGHT_ON_TIME,
      payload: changedProps,
    });
  }
};

// Example usage:
// const myState = {
//   /* your state data */
// };
// sendMessageToContentScript({ type: 'UPDATE_STATE', payload: myState });
