import { initSettings } from '../database/models/settings';
import { openDatabase } from '../database/schema';
import { isActiveTab } from '../utils';
import { onReceiveMessage } from './on-message';
import { onUrlChange } from './on-url-change';

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

// rerun everything when tab gets focus
document.addEventListener('visibilitychange', attachAllEventHandlers);
