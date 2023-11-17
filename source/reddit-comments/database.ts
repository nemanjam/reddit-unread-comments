import {
  currentSessionCreatedAt,
  databaseName,
  dbSizeLimit,
  dbTargetSize,
} from './constants';
import { sizeInMBString } from './utils';

export interface ThreadData {
  id?: number;
  threadId: string;
  updatedAt: number;
  latestCommentId?: string;
  /** In db store as numeric timestamp. Work with Date. */
  latestCommentTimestamp?: number;
}

export interface CommentData {
  id?: number;
  threadId: string;
  sessionCreatedAt: number;
  commentId: string;
}

/** Don't use globalDb, use db = await openDatabase(). */
export let globalDb: IDBDatabase | null = null;

/** Returns database or throws exception. */
export const openDatabase = async (): Promise<IDBDatabase> => {
  const openDatabaseLocal = async (): Promise<IDBDatabase> => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);

      request.onupgradeneeded = onUpgradeNeeded;
      request.onsuccess = (event) => onSuccess(resolve, event);
      request.onerror = (event) => onError(reject, event);
    });
  };

  try {
    const db = await openDatabaseLocal();
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

const Thread = {
  ThreadObjectStore: 'Thread',
  ThreadIdIndex: 'ThreadIdIndex',
  UpdatedAtIndex: 'UpdatedAtIndex',
  LatestCommentIdIndex: 'LatestCommentIdIndex',
  LatestCommentTimestampIndex: 'LatestCommentTimestampIndex',
} as const;

const Comment = {
  CommentObjectStore: 'Comment',
  CommentIdIndex: 'CommentIdIndex',
  ThreadIdIndex: 'ThreadIdIndex',
  SessionCreatedAtIndex: 'SessionCreatedAtIndex',
  CommentIdThreadIdIndex: 'CommentIdThreadIdIndex',
} as const;

// Create schema
const onUpgradeNeeded = (event: IDBVersionChangeEvent) => {
  const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

  // Create Thread object store - table
  const threadObjectStore = db.createObjectStore(Thread.ThreadObjectStore, {
    keyPath: 'id',
    autoIncrement: true,
  });
  threadObjectStore.createIndex(Thread.ThreadIdIndex, 'threadId', { unique: true });
  threadObjectStore.createIndex(Thread.UpdatedAtIndex, 'updatedAt', { unique: false });
  threadObjectStore.createIndex(Thread.LatestCommentIdIndex, 'latestCommentId', {
    unique: false,
  });
  threadObjectStore.createIndex(
    Thread.LatestCommentTimestampIndex,
    'latestCommentTimestamp',
    {
      unique: false,
    }
  );

  // Create Comment object store - table
  const commentObjectStore = db.createObjectStore(Comment.CommentObjectStore, {
    keyPath: 'id',
    autoIncrement: true,
  });
  commentObjectStore.createIndex(Comment.CommentIdIndex, 'commentId', { unique: true });
  commentObjectStore.createIndex(Comment.ThreadIdIndex, 'threadId', { unique: false });
  commentObjectStore.createIndex(Comment.SessionCreatedAtIndex, 'sessionCreatedAt', {
    unique: false,
  });

  // Optionally, create a compound index for commentId and threadId as a pseudo-primary key - constraint only
  commentObjectStore.createIndex(
    Comment.CommentIdThreadIdIndex,
    ['commentId', 'threadId'],
    {
      unique: true,
    }
  );
};

const onSuccess = (
  resolve: (value: IDBDatabase | PromiseLike<IDBDatabase>) => void,
  event: Event
) => {
  console.log('Database connected successfully.');
  const db = (event.target as IDBRequest).result as IDBDatabase;
  globalDb = db;
  resolve(db);
};

const onError = (reject: (reason?: any) => void, event: Event) => {
  console.error('Database connection failed.');
  reject((event.target as IDBRequest).error);
};

export const addThread = async (
  db: IDBDatabase,
  threadData: ThreadData
): Promise<ThreadData> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(Thread.ThreadObjectStore, 'readwrite');
    const threadObjectStore = transaction.objectStore(Thread.ThreadObjectStore);

    const addObjectRequest = threadObjectStore.add(threadData);

    addObjectRequest.onsuccess = (event) => {
      const addedThreadId = (event.target as IDBRequest).result as number;

      // Retrieve the added thread using the ID
      const getRequest = threadObjectStore.get(addedThreadId);

      getRequest.onsuccess = (event) => {
        const addedThread = (event.target as IDBRequest).result as ThreadData;
        resolve(addedThread);
      };

      getRequest.onerror = () => reject(transaction.error);
    };

    addObjectRequest.onerror = () => reject(transaction.error);
    transaction.oncomplete = () =>
      console.log(`Thread with threadId: ${threadData.threadId} added successfully.`);
  });

export const getThread = async (
  db: IDBDatabase,
  threadId: string
): Promise<ThreadData | undefined> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(Thread.ThreadObjectStore, 'readonly');
    const threadObjectStore = transaction.objectStore(Thread.ThreadObjectStore);
    const getRequest = threadObjectStore.index(Thread.ThreadIdIndex).get(threadId);

    getRequest.onsuccess = () => resolve(getRequest.result as ThreadData);
    getRequest.onerror = () => reject(transaction.error);
  });

export const updateThread = async (
  db: IDBDatabase,
  updatedThreadData: Partial<ThreadData>
): Promise<ThreadData> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(Thread.ThreadObjectStore, 'readwrite');
    const threadObjectStore = transaction.objectStore(Thread.ThreadObjectStore);

    const getRequest = threadObjectStore
      .index(Thread.ThreadIdIndex)
      .get(updatedThreadData.threadId as string);

    getRequest.onsuccess = (event) => {
      const existingThread = (event.target as IDBRequest).result as ThreadData;

      if (existingThread) {
        // Merge the existing thread with the updated data
        const mergedThread = { ...existingThread, ...updatedThreadData };

        // Update the thread in the object store
        const updateRequest = threadObjectStore.put(mergedThread);

        updateRequest.onsuccess = () => {
          console.log(
            `Thread with threadId: ${updatedThreadData.threadId} updated successfully.`
          );
          resolve(mergedThread);
        };

        updateRequest.onerror = (event) => {
          console.error('Error updating thread:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      } else {
        const message = `Thread with threadId: ${updatedThreadData.threadId} not found.`;
        console.error(message);
        reject(message);
      }
    };

    getRequest.onerror = (event) => {
      console.error(
        'Error fetching thread for update:',
        (event.target as IDBRequest).error
      );
      reject((event.target as IDBRequest).error);
    };
  });
};

export const getComment = async (
  db: IDBDatabase,
  commentId: string
): Promise<CommentData | undefined> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(Comment.CommentObjectStore, 'readonly');
    const commentObjectStore = transaction.objectStore(Comment.CommentObjectStore);
    const getRequest = commentObjectStore.index(Comment.CommentIdIndex).get(commentId);

    getRequest.onsuccess = () => resolve(getRequest.result as CommentData);
    getRequest.onerror = () => reject(transaction.error);
  });

export const addComment = async (
  db: IDBDatabase,
  commentData: CommentData
): Promise<CommentData> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(Comment.CommentObjectStore, 'readwrite');
    const commentObjectStore = transaction.objectStore(Comment.CommentObjectStore);

    const addObjectRequest = commentObjectStore.add(commentData);

    addObjectRequest.onsuccess = (event) => {
      const addedCommentId = (event.target as IDBRequest).result as number;

      // Retrieve the added Comment using the ID
      const getRequest = commentObjectStore.get(addedCommentId);

      getRequest.onsuccess = (event) => {
        const addedComment = (event.target as IDBRequest).result as CommentData;
        resolve(addedComment);
      };

      getRequest.onerror = () => reject(transaction.error);
    };

    addObjectRequest.onerror = () => reject(transaction.error);
    transaction.oncomplete = () =>
      console.log(
        `Comment with commentId: ${commentData.commentId}, threadId: ${commentData.threadId} added successfully.`
      );
  });

export const updateComment = async (
  db: IDBDatabase,
  updatedCommentData: Partial<CommentData>
): Promise<CommentData> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(Comment.CommentObjectStore, 'readwrite');
    const commentObjectStore = transaction.objectStore(Comment.CommentObjectStore);

    const getRequest = commentObjectStore
      .index(Comment.CommentIdIndex)
      .get(updatedCommentData.commentId as string);

    getRequest.onsuccess = (event) => {
      const existingComment = (event.target as IDBRequest).result as CommentData;

      if (existingComment) {
        // Merge the existing comment with the updated data
        const mergedComment = { ...existingComment, ...updatedCommentData };

        // Update the comment in the object store
        const updateRequest = commentObjectStore.put(mergedComment);

        updateRequest.onsuccess = () => {
          console.log(
            `Comment with commentId: ${updatedCommentData.commentId} updated successfully.`
          );
          resolve(mergedComment);
        };

        updateRequest.onerror = (event) => {
          console.error('Error updating comment:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      } else {
        const message = `Comment with commentId: ${updatedCommentData.commentId} not found.`;
        console.error(message);
        reject(message);
      }
    };

    getRequest.onerror = (event) => {
      console.error(
        'Error fetching comment for update:',
        (event.target as IDBRequest).error
      );
      reject((event.target as IDBRequest).error);
    };
  });
};

export const getAllCommentsForThread = async (
  db: IDBDatabase,
  threadId: string
): Promise<CommentData[]> =>
  new Promise<CommentData[]>((resolve, reject) => {
    const transaction = db.transaction(Comment.CommentObjectStore, 'readonly');
    const objectStore = transaction.objectStore(Comment.CommentObjectStore);
    const index = objectStore.index(Thread.ThreadIdIndex);

    const comments: CommentData[] = [];

    index.openCursor(IDBKeyRange.only(threadId)).onsuccess = (cursorEvent) => {
      const cursor = (cursorEvent.target as IDBRequest<IDBCursorWithValue>).result;

      if (cursor) {
        comments.push(cursor.value);
        cursor.continue();
      } else {
        resolve(comments);
      }
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });

/** Returns all comments for thread except comments from current session. */
export const getCommentsForThreadWithoutCurrentSession = async (
  db: IDBDatabase,
  threadId: string
): Promise<CommentData[]> =>
  (await getAllCommentsForThread(db, threadId)).filter(
    (comment) => comment.sessionCreatedAt !== currentSessionCreatedAt
  );

export const getCommentsForThreadForCurrentSession = async (
  db: IDBDatabase,
  threadId: string
): Promise<CommentData[]> =>
  (await getAllCommentsForThread(db, threadId)).filter(
    (comment) => comment.sessionCreatedAt === currentSessionCreatedAt
  );

export const updateCommentsSessionCreatedAtForThread = (
  db: IDBDatabase,
  threadId: string,
  sessionCreatedAt: number
): Promise<CommentData[]> =>
  new Promise<CommentData[]>((resolve, reject) => {
    getAllCommentsForThread(db, threadId)
      .then((comments) => {
        const commentsToUpdate = comments.filter(
          (comment) => comment.sessionCreatedAt === currentSessionCreatedAt
        );

        if (!(commentsToUpdate.length > 0)) return resolve([]);

        const updatePromises = commentsToUpdate.map((comment) =>
          updateComment(db, {
            ...comment,
            sessionCreatedAt,
          })
        );

        Promise.all(updatePromises)
          .then((updatedComments) => resolve(updatedComments))
          .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
  });

export const truncateDatabase = async () => {
  const db = await openDatabase();

  const truncateObjectStore = (storeName: string) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);

      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  };

  try {
    await truncateObjectStore(Thread.ThreadObjectStore);
    console.log(`Data truncated in ${Thread.ThreadObjectStore} successfully.`);

    await truncateObjectStore(Comment.CommentObjectStore);
    console.log(`Data truncated in ${Comment.CommentObjectStore} successfully.`);
  } catch (error) {
    console.error('Error truncating data:', error);
  }
};

export const deleteCommentsForThread = async (
  db: IDBDatabase,
  threadId: string
): Promise<void> => {
  const threadTransaction: IDBTransaction = db.transaction(
    [Comment.CommentObjectStore],
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
      console.log(`Deleting comment with commentId: ${commentId}`);

      cursor.delete();
      cursor.continue();
    }
  };

  return new Promise<void>((resolve, reject) => {
    threadTransaction.oncomplete = () => {
      console.log(`Deleted comments for thread with threadId: ${threadId}`);
      resolve();
    };

    threadTransaction.onerror = (event: Event) => {
      console.error('Error deleting comments:', (event.target as IDBRequest).error);
      reject();
    };
  });
};

export const deleteThreadWithComments = async (
  db: IDBDatabase,
  threadId: string
): Promise<void> => {
  // Delete comments for the thread
  await deleteCommentsForThread(db, threadId);

  const deleteTransaction: IDBTransaction = db.transaction(
    [Thread.ThreadObjectStore],
    'readwrite'
  );
  const deleteObjectStore: IDBObjectStore = deleteTransaction.objectStore(
    Thread.ThreadObjectStore
  );

  // Delete the thread
  const deleteRequest = deleteObjectStore.delete(threadId);

  return new Promise<void>((resolve, reject) => {
    deleteRequest.onsuccess = () => {
      console.log(`Deleted thread with threadId: ${threadId}`);
      resolve();
    };

    deleteRequest.onerror = (event: Event) => {
      console.error('Error deleting thread:', (event.target as IDBRequest).error);
      reject();
    };
  });
};

export const getCurrentDatabaseSize = async (db: IDBDatabase): Promise<number> =>
  new Promise<number>((resolve, reject) => {
    const transaction = db.transaction(
      [Thread.ThreadObjectStore, Comment.CommentObjectStore],
      'readonly'
    );
    const threadObjectStore = transaction.objectStore(Thread.ThreadObjectStore);
    const commentObjectStore = transaction.objectStore(Comment.CommentObjectStore);

    const getAllThreads = threadObjectStore.getAll();
    const getAllComments = commentObjectStore.getAll();

    Promise.all([getAllThreads, getAllComments])
      .then(([threadResults, commentResults]) => {
        const currentSizeThreads: number = JSON.stringify(threadResults).length;
        const currentSizeComments: number = JSON.stringify(commentResults).length;

        const totalSize: number = currentSizeThreads + currentSizeComments;

        resolve(totalSize);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const limitIndexedDBSize = async (db: IDBDatabase): Promise<void> => {
  let currentSize = await getCurrentDatabaseSize(db);

  console.log('Reducing database size, checking...');

  if (currentSize <= dbSizeLimit) {
    const message = `Database reducing size is not needed, \
currentSize: ${sizeInMBString(currentSize)} MB, \
dbSizeLimit: ${sizeInMBString(dbSizeLimit)} MB. Exiting.`;

    console.log(message);
    return;
  }

  const transaction: IDBTransaction = db.transaction(
    [Thread.ThreadObjectStore],
    'readonly'
  );
  const threadObjectStore: IDBObjectStore = transaction.objectStore(
    Thread.ThreadObjectStore
  );

  threadObjectStore.getAll().onsuccess = async (event: Event) => {
    const threads: ThreadData[] = (event.target as IDBRequest).result;

    // Create a sorted copy of threads by the updatedAt column in ascending order
    const sortedThreads: ThreadData[] = threads
      .slice()
      .sort((a, b) => a.updatedAt - b.updatedAt);

    for (const thread of sortedThreads) {
      // Delete the thread
      await deleteThreadWithComments(db, thread.threadId);

      // Check the current size of the database after each deletion
      currentSize = await getCurrentDatabaseSize(db);

      console.log(`Deleting threads, currentSize: ${sizeInMBString(currentSize)} MB.`);

      if (currentSize < dbTargetSize) {
        const message = `Database size reducing finished, \
currentSize: ${sizeInMBString(currentSize)} MB \
dbTargetSize: ${sizeInMBString(dbTargetSize)} MB.`;

        console.log(message);
        break;
      }
    }
  };
};
