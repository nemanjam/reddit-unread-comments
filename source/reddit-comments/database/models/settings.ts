import { MyModelNotFoundDBException } from '../../exceptions';
import logger from '../../logger';
import { Settings, SettingsData } from '../schema';

export const settingsId = 1 as const;

export const defaultDbValues: SettingsData = {
  id: settingsId,
  isHighlightOnTime: false,
  timeSlider: 0,
  timeScale: '6h',
  unHighlightOn: 'on-scroll',
  scrollTo: 'both',
  sortAllByNew: false,
  enableLogger: false,
} as const;

export const defaultValues: SettingsData = {
  ...defaultDbValues,
  resetDb: '',
} as const;

export const addSettings = async (
  db: IDBDatabase,
  settingsData: SettingsData
): Promise<SettingsData> =>
  new Promise<SettingsData>((resolve, reject) => {
    const transaction = db.transaction(Settings.SettingsObjectStore, 'readwrite');
    const settingsObjectStore = transaction.objectStore(Settings.SettingsObjectStore);

    const addObjectRequest = settingsObjectStore.add(settingsData);

    addObjectRequest.onsuccess = (event) => {
      const addedSettingsId = (event.target as IDBRequest).result as number;

      // Retrieve the added Settings using the ID
      const getRequest = settingsObjectStore.get(addedSettingsId);

      getRequest.onsuccess = (event) => {
        const addedSettings = (event.target as IDBRequest).result as SettingsData;
        resolve(addedSettings);
      };

      getRequest.onerror = () => reject(transaction.error);
    };

    addObjectRequest.onerror = () => reject(transaction.error);

    transaction.oncomplete = () =>
      logger.info(`Settings with id: ${settingsData.id} added successfully.`);
  });

export const initSettings = async (db: IDBDatabase): Promise<void> => {
  logger.info('Checking defaultDbSettings...');

  const existingSettings = await getSettings(db).catch((_error) =>
    logger.info('defaultDbSettings not found, adding settings...')
  );

  if (!existingSettings) {
    const settingsData = await addSettings(db, defaultDbValues);
    logger.info('added defaultDbSettings', settingsData);
  }
};

export const updateSettings = async (
  db: IDBDatabase,
  updatedSettings: Partial<SettingsData>
): Promise<SettingsData> => {
  return new Promise<SettingsData>((resolve, reject) => {
    const transaction = db.transaction(Settings.SettingsObjectStore, 'readwrite');
    const settingsObjectStore = transaction.objectStore(Settings.SettingsObjectStore);

    const getRequest = settingsObjectStore.get(settingsId);

    getRequest.onsuccess = () => {
      const existingSettings = getRequest.result;

      if (existingSettings) {
        // update
        const updatedObject = { ...existingSettings, ...updatedSettings };

        const updateRequest = settingsObjectStore.put(updatedObject);

        updateRequest.onsuccess = (event) => {
          logger.info('Updated Settings instance.');
          const updatedSettings = (event.target as IDBRequest).result as SettingsData;
          resolve(updatedSettings);
        };

        updateRequest.onerror = (event) => {
          logger.error('Error updating settings:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      } else {
        // If no settings with ID 1 exists, you can choose to reject or create a new one
        logger.error('Settings not found for update.');
        reject(new Error('Settings not found for update.'));
      }
    };

    getRequest.onerror = (event) => {
      logger.error(
        'Error checking existing settings:',
        (event.target as IDBRequest).error
      );
      reject((event.target as IDBRequest).error);
    };
  });
};

export const resetSettings = async (db: IDBDatabase): Promise<SettingsData> => {
  const resetSettings = await updateSettings(db, defaultValues);
  return resetSettings;
};

export const getSettings = async (db: IDBDatabase): Promise<SettingsData> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(Settings.SettingsObjectStore, 'readonly');
    const settingsObjectStore = transaction.objectStore(Settings.SettingsObjectStore);
    const getRequest = settingsObjectStore.get(settingsId);

    //! error is that row isn't inserted in correct entry point
    getRequest.onsuccess = () => {
      const result = getRequest.result as SettingsData;
      if (!result)
        reject(
          new MyModelNotFoundDBException(`SettingsData with id:${settingsId} not found.`)
        );

      resolve(result);
    };

    getRequest.onerror = () => reject(transaction.error);
  });
