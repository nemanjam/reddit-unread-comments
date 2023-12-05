import { dbSizeLimit, dbTargetSize } from '../constants';
import { MyDeleteModelFailedDBException } from '../exceptions';
import logger from '../logger';
import { sizeInMBString } from '../utils';
import {
  openDatabase,
  Thread,
  Comment,
  ThreadData,
  Settings,
  CommentData,
  SettingsData,
} from './schema';

export const deleteCommentsForThread = async (
  db: IDBDatabase,
  threadId: string
): Promise<void> => {
  const threadTransaction: IDBTransaction = db.transaction(
    Comment.CommentObjectStore,
    'readwrite'
  );
  const commentObjectStore: IDBObjectStore = threadTransaction.objectStore(
    Comment.CommentObjectStore
  );

  // Delete all comments with the matching threadId
  const commentIndex = commentObjectStore.index(Comment.ThreadIdIndex);
  const commentCursorRequest = commentIndex.openCursor(IDBKeyRange.only(threadId));

  commentCursorRequest.onsuccess = (cursorEvent: Event) => {
    const cursor: IDBCursorWithValue = (cursorEvent.target as IDBRequest).result;

    if (cursor) {
      const commentId: string = cursor.value.commentId;
      logger.info(`Deleting comment with commentId: ${commentId}`);

      cursor.delete();
      cursor.continue();
    }
  };

  return new Promise<void>((resolve, reject) => {
    threadTransaction.oncomplete = () => {
      logger.info(`Deleted comments for thread with threadId: ${threadId}`);
      resolve();
    };

    threadTransaction.onerror = (event: Event) => {
      logger.error('Error deleting comments:', (event.target as IDBRequest).error);
      reject();
    };
  });
};

export const deleteThreadWithComments = async (
  db: IDBDatabase,
  threadId: string
): Promise<string> => {
  // Delete comments for the thread
  await deleteCommentsForThread(db, threadId);

  const deleteTransaction: IDBTransaction = db.transaction(
    Thread.ThreadObjectStore,
    'readwrite'
  );
  const deleteObjectStore: IDBObjectStore = deleteTransaction.objectStore(
    Thread.ThreadObjectStore
  );

  const getRequest = deleteObjectStore.index(Thread.ThreadIdIndex).get(threadId);

  return new Promise<string>((resolve, reject) => {
    getRequest.onsuccess = (event: Event) => {
      const threadToDelete = (event.target as IDBRequest).result;

      if (threadToDelete) {
        // Delete the thread
        const deleteRequest = deleteObjectStore.delete(threadToDelete.id);

        deleteRequest.onsuccess = () => {
          logger.info(`Deleted thread with threadId: ${threadId}`);
          resolve(threadId);
        };

        deleteRequest.onerror = (deleteEvent: Event) => {
          logger.error(
            'Error deleting thread:',
            (deleteEvent.target as IDBRequest).error
          );
          reject();
        };
      } else {
        // Thread not found
        logger.warn(`Thread with threadId: ${threadId} not found`);
        resolve(threadId);
      }
    };

    getRequest.onerror = (event: Event) => {
      logger.error('Error getting thread:', (event.target as IDBRequest).error);
      reject();
    };
  });
};

export const getCurrentDatabaseSize = async (db: IDBDatabase): Promise<number> =>
  new Promise<number>((resolve, reject) => {
    const transaction = db.transaction(
      [
        Thread.ThreadObjectStore,
        Comment.CommentObjectStore,
        Settings.SettingsObjectStore,
      ],
      'readonly'
    );
    const threadObjectStore = transaction.objectStore(Thread.ThreadObjectStore);
    const commentObjectStore = transaction.objectStore(Comment.CommentObjectStore);
    const settingsObjectStore = transaction.objectStore(Settings.SettingsObjectStore);

    let threadResults: any[];
    let commentResults: any[];
    let settingsResults: any[];

    const getAllThreads: IDBRequest<any[]> = threadObjectStore.getAll();
    getAllThreads.onsuccess = (event: Event) => {
      threadResults = (event.target as IDBRequest<any[]>).result;

      const getAllComments: IDBRequest<any[]> = commentObjectStore.getAll();
      getAllComments.onsuccess = (event: Event) => {
        commentResults = (event.target as IDBRequest<any[]>).result;

        const getAllSettings: IDBRequest<any[]> = settingsObjectStore.getAll();
        getAllSettings.onsuccess = (event: Event) => {
          settingsResults = (event.target as IDBRequest<any[]>).result;

          const currentSizeThreads: number = JSON.stringify(threadResults).length;
          const currentSizeComments: number = JSON.stringify(commentResults).length;
          const currentSizeSettings: number = JSON.stringify(settingsResults).length;

          const totalSize: number =
            currentSizeThreads + currentSizeComments + currentSizeSettings;

          resolve(totalSize);
        };

        getAllSettings.onerror = (event: Event) => {
          reject((event.target as IDBRequest).error);
        };
      };

      getAllComments.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    };

    getAllThreads.onerror = (event: Event) => {
      reject((event.target as IDBRequest).error);
    };
  });

export const limitIndexedDBSize = async (db: IDBDatabase): Promise<void> => {
  let currentSize = await getCurrentDatabaseSize(db);
  let initialSize = currentSize;

  logger.info('Reducing database size, checking...');

  if (currentSize <= dbSizeLimit) {
    const message = `Database reducing size is not needed, \
currentSize: ${sizeInMBString(currentSize)} MB, \
dbSizeLimit: ${sizeInMBString(dbSizeLimit)} MB. Exiting.`;

    logger.info(message);
    return;
  } else {
    const message = `Detected database oversize, started deleting..., \
currentSize: ${sizeInMBString(currentSize)} MB > \
dbSizeLimit: ${sizeInMBString(dbSizeLimit)} MB.`;

    logger.info(message);
  }

  const transaction: IDBTransaction = db.transaction(
    Thread.ThreadObjectStore,
    'readonly'
  );
  const threadObjectStore: IDBObjectStore = transaction.objectStore(
    Thread.ThreadObjectStore
  );

  threadObjectStore.getAll().onsuccess = async (event: Event) => {
    const threads: ThreadData[] = (event.target as IDBRequest).result;

    // Create a sorted copy of threads by the updatedAt column in ascending order
    const sortedThreadsAsc = threads.slice().sort((a, b) => a.updatedAt - b.updatedAt);

    for (const thread of sortedThreadsAsc) {
      // Delete the thread
      await deleteThreadWithComments(db, thread.threadId);

      // Check the current size of the database after each deletion
      currentSize = await getCurrentDatabaseSize(db);

      const message1 = `Deleting threads, \
currentSize: ${sizeInMBString(currentSize)} MB, \
dbTargetSize: ${sizeInMBString(dbTargetSize)} MB.`;
      logger.info(message1);

      if (currentSize < dbTargetSize) {
        const freedSize = initialSize - currentSize;

        const message = `Database size reducing finished, \
currentSize: ${sizeInMBString(currentSize)} MB, \
dbTargetSize: ${sizeInMBString(dbTargetSize)} MB, \
dbSizeLimit: ${sizeInMBString(dbSizeLimit)} MB. \
initialSize: ${sizeInMBString(initialSize)} MB. \
freedSize: ${sizeInMBString(freedSize)} MB.`;

        logger.info(message);
        break;
      }
    }
  };
};

const truncateObjectStore = (db: IDBDatabase, storeName: string) => {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.clear();

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

export const truncateDatabase = async () => {
  const db = await openDatabase();

  try {
    await truncateObjectStore(db, Thread.ThreadObjectStore);
    logger.info(`Data truncated in ${Thread.ThreadObjectStore} successfully.`);

    await truncateObjectStore(db, Comment.CommentObjectStore);
    logger.info(`Data truncated in ${Comment.CommentObjectStore} successfully.`);

    await truncateObjectStore(db, Settings.SettingsObjectStore);
    logger.info(`Data truncated in ${Settings.SettingsObjectStore} successfully.`);
  } catch (error) {
    logger.error('Error truncating data:', error);
  }
};

export const deleteAllThreadsWithComments = async (db: IDBDatabase): Promise<boolean> => {
  try {
    await truncateObjectStore(db, Comment.CommentObjectStore);
    logger.info(`Data truncated in ${Comment.CommentObjectStore} successfully.`);

    await truncateObjectStore(db, Thread.ThreadObjectStore);
    logger.info(`Data truncated in ${Thread.ThreadObjectStore} successfully.`);

    // Success
    return true;
  } catch (error) {
    throw new MyDeleteModelFailedDBException(
      `Failed to delete all threads with comments: ${error.message}`
    );
  }
};

export type DbDataType = {
  [Thread.ThreadObjectStore]: ThreadData[];
  [Comment.CommentObjectStore]: CommentData[];
  [Settings.SettingsObjectStore]: SettingsData[];
};

/** Used only for debugging. */
export const getAllDbData = (db: IDBDatabase): Promise<DbDataType> =>
  new Promise((resolve, reject) => {
    const allData: DbDataType = {
      [Thread.ThreadObjectStore]: [],
      [Comment.CommentObjectStore]: [],
      [Settings.SettingsObjectStore]: [],
    };

    const transaction = db.transaction(
      [
        Thread.ThreadObjectStore,
        Comment.CommentObjectStore,
        Settings.SettingsObjectStore,
      ],
      'readonly'
    );

    // Helper function to handle cursor events
    const handleCursor = (storeName: keyof DbDataType) => (event: Event) => {
      const cursor: IDBCursorWithValue = (event.target as IDBRequest).result;
      if (cursor) {
        allData[storeName].push(cursor.value);
        cursor.continue();
      }
    };

    // Open cursors for Thread, Comment, and Settings object stores
    const threadObjectStore = transaction.objectStore(Thread.ThreadObjectStore);
    threadObjectStore.openCursor().onsuccess = handleCursor(Thread.ThreadObjectStore);

    const commentObjectStore = transaction.objectStore(Comment.CommentObjectStore);
    commentObjectStore.openCursor().onsuccess = handleCursor(Comment.CommentObjectStore);

    const settingsObjectStore = transaction.objectStore(Settings.SettingsObjectStore);
    settingsObjectStore.openCursor().onsuccess = handleCursor(
      Settings.SettingsObjectStore
    );

    transaction.oncomplete = () => {
      resolve(allData);
    };

    transaction.onerror = (event) => {
      reject(
        new Error(
          'Error reading data from object stores: ' +
            (event.target as IDBOpenDBRequest).error
        )
      );
    };
  });
