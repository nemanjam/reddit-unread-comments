import { ARRIVED_TO_REDDIT_THREAD_EVENT_NAME } from '../constants/events';
import { truncateDatabase } from '../database/limit-size';
import { initSettings } from '../database/models/settings';
import { openDatabase } from '../database/schema';
import { isRedditThreadWithHref } from '../utils';
import { handleCtrlSpaceKeyDown } from './on-key-down';
import { onReceiveMessage } from './on-message';
import { debouncedScrollHandler } from './on-scroll';
import {
  debouncedArrivedToRedditThreadHandler,
  dispatchArrivedToRedditThreadEvent,
} from './on-thread';
import { onUrlChange } from './on-url-change';

/*-------------------------------- Entry point ------------------------------*/

// fails for current tab for many tabs, add retry
let isAttachedOnce = false;
export const attachAllEventHandlers = async () => {
  if (isAttachedOnce) return;

  //!important: attach in background tabs too
  if (!isRedditThreadWithHref()) return;

  // await truncateDatabase();

  // create database
  const db = await openDatabase();
  await initSettings(db);

  // attach once unconditionally
  document.addEventListener('scroll', debouncedScrollHandler);

  // listen keys on document
  document.addEventListener('keydown', handleCtrlSpaceKeyDown);

  document.addEventListener(
    ARRIVED_TO_REDDIT_THREAD_EVENT_NAME,
    debouncedArrivedToRedditThreadHandler
  );

  onReceiveMessage();
  onUrlChange();

  // on bottom
  isAttachedOnce = true;
};

// only dispatch onThread, don't re-attach handlers, attached unconditionally
document.addEventListener('visibilitychange', dispatchArrivedToRedditThreadEvent);
