import { Settings, SettingsData } from '../schema';

export const defaultValues: SettingsData = {
  isHighlightOnTime: true,
  timeSlider: 0,
  timeScale: '6h',
  unHighlightOn: 'on-scroll',
  scrollTo: 'both',
  sortAllByNew: false,
  resetDb: '',
} as const;

export const settingsId = 1 as const;

export const getOrCreateSettings = async (db: IDBDatabase) => {
  return new Promise<SettingsData>((resolve, reject) => {
    const transaction = db.transaction(Settings.SettingsObjectStore, 'readwrite');
    const settingsObjectStore = transaction.objectStore(Settings.SettingsObjectStore);

    const getRequest = settingsObjectStore.get(settingsId);

    getRequest.onsuccess = () => {
      const existingSettings = getRequest.result;

      if (!existingSettings) {
        // create
        // If no settings with ID 1 exists, add a new one
        const addRequest = settingsObjectStore.add({ id: settingsId, ...defaultValues });

        addRequest.onsuccess = (event) => {
          console.log('Created single Settings instance.');
          const addedSettings = (event.target as IDBRequest).result as SettingsData;
          resolve(addedSettings);
        };

        addRequest.onerror = (event) => {
          console.error(
            'Error initializing settings:',
            (event.target as IDBRequest).error
          );
          reject((event.target as IDBRequest).error);
        };
      } else {
        // get
        resolve(existingSettings as SettingsData);
      }
    };

    getRequest.onerror = (event) => {
      console.error(
        'Error checking existing settings:',
        (event.target as IDBRequest).error
      );
      reject((event.target as IDBRequest).error);
    };
  });
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
          console.log('Updated Settings instance.');
          const updatedSettings = (event.target as IDBRequest).result as SettingsData;
          resolve(updatedSettings);
        };

        updateRequest.onerror = (event) => {
          console.error('Error updating settings:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      } else {
        // If no settings with ID 1 exists, you can choose to reject or create a new one
        console.error('Settings not found for update.');
        reject(new Error('Settings not found for update.'));
      }
    };

    getRequest.onerror = (event) => {
      console.error(
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

    getRequest.onsuccess = () => {
      // omit id
      const { id, ...settingsData } = getRequest.result;
      resolve(settingsData as SettingsData);
    };
    getRequest.onerror = () => reject(transaction.error);
  });
