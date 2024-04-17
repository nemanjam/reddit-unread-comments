import 'emoji-log';
import browser from 'webextension-polyfill';

// for Chrome manifest v3
browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'extension installed');
});
