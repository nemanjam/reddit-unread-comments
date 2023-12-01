import browser from 'webextension-polyfill';

export interface MyMessageType {
  type: MessageTypes;
  payload?: any;
}

export const messageTypes = {
  GET_SETTINGS_DATA_FROM_DB: 'GET_SETTINGS_DATA_FROM_DB',
  SUBMIT_SETTINGS_DATA: 'SUBMIT_SETTINGS_DATA',
  RESET_SETTINGS_DATA: 'RESET_SETTINGS_DATA',
  RESET_ALL_THREADS_DATA: 'RESET_ALL_THREADS_DATA',
  RESET_THREAD_DATA: 'RESET_THREAD_DATA',
} as const;

export type MessageTypes = (typeof messageTypes)[keyof typeof messageTypes];

export const sendMessage = async (message: MyMessageType): Promise<any> => {
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
