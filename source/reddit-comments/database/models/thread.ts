import { currentSessionCreatedAt } from '../../constants';
import { ThreadData, Thread, CommentData, Comment } from '../schema';
import { updateComment } from './comment';

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