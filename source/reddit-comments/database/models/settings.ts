import { Settings, SettingsData } from '../schema';

export const defaultValues: SettingsData = {
  isHighlightOnTime: false,
  timeSlider: 0,
  timeScale: '6h',
  unHighlightOn: 'on-scroll',
  scrollTo: 'both',
  sortAllByNew: false,
  resetDb: '',
} as const;

export const settingsId = 1 as const;

export const initializeSettings = async (db: IDBDatabase) => {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(Settings.SettingsObjectStore, 'readwrite');
    const settingsObjectStore = transaction.objectStore(Settings.SettingsObjectStore);

    const getRequest = settingsObjectStore.get(settingsId);

    getRequest.onsuccess = () => {
      const existingSettings = getRequest.result;

      if (!existingSettings) {
        // If no settings with ID 1 exists, add a new one
        const addRequest = settingsObjectStore.add({ id: settingsId, ...defaultValues });

        addRequest.onsuccess = () => {
          console.log('Settings initialized successfully.');
          resolve();
        };

        addRequest.onerror = (event) => {
          console.error(
            'Error initializing settings:',
            (event.target as IDBRequest).error
          );
          reject((event.target as IDBRequest).error);
        };
      } else {
        // Settings with ID 1 already exist, no need to initialize
        console.log('Settings instance already exists.');
        resolve();
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

export const getSettings = async (db: IDBDatabase): Promise<SettingsData | undefined> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(Settings.SettingsObjectStore, 'readonly');
    const settingsObjectStore = transaction.objectStore(Settings.SettingsObjectStore);
    const getRequest = settingsObjectStore
      .index(Settings.SettingsIdIndex)
      .get(settingsId);

    getRequest.onsuccess = () => {
      // omit id
      const { id, ...settingsData } = getRequest.result;
      resolve(settingsData as SettingsData);
    };
    getRequest.onerror = () => reject(transaction.error);
  });
