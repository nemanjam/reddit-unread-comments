import { browser } from 'webextension-polyfill-ts';
import { defaultValues } from './database/models/settings';
import { SettingsData, SettingsDataKeys } from './database/schema';
import { pickShallow } from './utils';

export interface MyMessageType {
  type: MessageTypes;
  payload?: any;
}

export const messageTypes = {
  HIGHLIGHT_ON_TIME: 'HIGHLIGHT_ON_TIME',
} as const;

export type MessageTypes = (typeof messageTypes)[keyof typeof messageTypes];

export const sendMessageToContentScript = async (message: MyMessageType) => {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    if (activeTab?.id) {
      const response = await browser.tabs.sendMessage(activeTab.id, message);
      console.log('Response from content script:', response);
    } else {
      console.error('No active tab found.');
    }
  } catch (error) {
    console.error('Error sending message to content script:', error);
  }
};

export const detectChanges = (object1: SettingsData, object2: SettingsData): string[] => {
  const changes: string[] = [];

  for (const _key in object1) {
    const key = _key as SettingsDataKeys;

    if (object1.hasOwnProperty(key) && object1[key] !== object2[key]) {
      changes.push(key);
    }
  }

  return changes;
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

    sendMessageToContentScript({
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
