import { ARRIVED_TO_REDDIT_THREAD_EVENT_NAME } from '../constants/events';
import { truncateDatabase } from '../database/limit-size';
import { initSettings } from '../database/models/settings';
import { openDatabase } from '../database/schema';
import { isActiveTab } from '../utils';
import { handleCtrlSpaceKeyDown } from './on-key-down';
import { onReceiveMessage } from './on-message';
import { debouncedScrollHandler } from './on-scroll';
import { debouncedArrivedToRedditThreadHandler } from './on-thread';
import { onUrlChange } from './on-url-change';

/*-------------------------------- Entry point ------------------------------*/

export const attachAllEventHandlers = async () => {
  if (!isActiveTab()) return;

  // await truncateDatabase();

  // create database
  const db = await openDatabase();
  await initSettings(db);

  // attach once unconditionally
  document.addEventListener('scroll', debouncedScrollHandler);

  // listen keys on document
  document.addEventListener('keydown', handleCtrlSpaceKeyDown);

  // rerun everything when tab gets focus
  document.addEventListener('visibilitychange', attachAllEventHandlers);

  document.addEventListener(
    ARRIVED_TO_REDDIT_THREAD_EVENT_NAME,
    debouncedArrivedToRedditThreadHandler
  );

  onReceiveMessage();
  onUrlChange();
};
