import { attachAllEventHandlers } from '.';
import { tabFocusedWait } from '../constants/config';
import { wait } from '../utils';
import { dispatchArrivedToRedditThreadEvent } from './on-thread';

export const handleTabFocus = async () => {
  await attachAllEventHandlers();

  // because highlight functions have active tab check
  await wait(tabFocusedWait);

  dispatchArrivedToRedditThreadEvent();
};
