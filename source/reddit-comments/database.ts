import { databaseName } from './constants';

export interface ThreadData {
  id?: number;
  threadId: string;
  updatedAt: Date;
  latestCommentId: string;
  latestCommentTimestamp: Date;
}

export interface CommentData {
  id?: number;
  commentId: string;
  threadId: string;
}

export let globalDb: IDBDatabase | null = null;

export const openDatabase = async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);

    request.onupgradeneeded = onUpgradeNeeded;
    request.onsuccess = (event) => onSuccess(resolve, event);
    request.onerror = (event) => onError(reject, event);
  });
};

const ThreadObjectStore = 'Thread' as const;
const CommentObjectStore = 'Comment' as const;

// Create schema
const onUpgradeNeeded = (event: IDBVersionChangeEvent) => {
  const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

  // Create Thread object store - table
  const threadObjectStore = db.createObjectStore(ThreadObjectStore, {
    keyPath: 'id',
    autoIncrement: true,
  });
  threadObjectStore.createIndex('ThreadIdIndex', 'threadId', { unique: true });
  threadObjectStore.createIndex('UpdatedAtIndex', 'updatedAt', { unique: false });
  threadObjectStore.createIndex('LatestCommentIdIndex', 'latestCommentId', {
    unique: false,
  });
  threadObjectStore.createIndex('LatestCommentTimestampIndex', 'latestCommentTimestamp', {
    unique: false,
  });

  // Create Comment object store - table
  const commentObjectStore = db.createObjectStore(CommentObjectStore, {
    keyPath: 'id',
    autoIncrement: true,
  });
  commentObjectStore.createIndex('CommentIdIndex', 'commentId', { unique: true });
  commentObjectStore.createIndex('ThreadIdIndex', 'threadId', { unique: false });

  // Optionally, create a compound index for commentId and threadId as a pseudo-primary key - constraint only
  commentObjectStore.createIndex('CommentThreadIdIndex', ['commentId', 'threadId'], {
    unique: true,
  });
};

const onSuccess = (
  resolve: (value: IDBDatabase | PromiseLike<IDBDatabase>) => void,
  event: Event
) => {
  const db = (event.target as IDBRequest).result as IDBDatabase;
  globalDb = db;
  resolve(db);
};

const onError = (reject: (reason?: any) => void, event: Event) => {
  reject((event.target as IDBRequest).error);
};

const addThread = async (db: IDBDatabase, threadData: ThreadData): Promise<number> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(ThreadObjectStore, 'readwrite');
    const threadObjectStore = transaction.objectStore(ThreadObjectStore);

    const addObjectRequest = threadObjectStore.add(threadData);

    addObjectRequest.onsuccess = (event) =>
      resolve((event.target as IDBRequest).result as number);
    addObjectRequest.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => console.log('Thread added successfully');
  });

const getThread = async (
  db: IDBDatabase,
  threadId: string
): Promise<ThreadData | undefined> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(ThreadObjectStore, 'readonly');
    const threadObjectStore = transaction.objectStore(ThreadObjectStore);
    const getRequest = threadObjectStore.get(threadId);

    getRequest.onsuccess = () => resolve(getRequest.result as ThreadData);
    getRequest.onerror = () => reject(transaction.error);
  });

const addComment = async (db: IDBDatabase, commentData: CommentData): Promise<number> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(CommentObjectStore, 'readwrite');
    const commentObjectStore = transaction.objectStore(CommentObjectStore);

    const addObjectRequest = commentObjectStore.add(commentData);

    addObjectRequest.onsuccess = (event) =>
      resolve((event.target as IDBRequest).result as number);
    addObjectRequest.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => console.log('Comment added successfully');
  });

const getComment = async (
  db: IDBDatabase,
  commentId: string
): Promise<CommentData | undefined> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(CommentObjectStore, 'readonly');
    const commentObjectStore = transaction.objectStore(CommentObjectStore);
    const getRequest = commentObjectStore.get(commentId);

    getRequest.onsuccess = () => resolve(getRequest.result as CommentData);
    getRequest.onerror = () => reject(transaction.error);
  });

// Example usage:
const exampleUsage = async (db: IDBDatabase) => {
  const threadId = 'yourThreadId';
  const commentId = 'yourCommentId';

  // Adding a thread
  const newThreadId = await addThread(db, {
    threadId,
    updatedAt: new Date(),
    latestCommentId: commentId,
    latestCommentTimestamp: new Date(),
  });

  // Retrieving a thread
  const retrievedThread = await getThread(db, threadId);
  console.log('Retrieved Thread:', retrievedThread);

  // Adding a comment
  const newCommentId = await addComment(db, { commentId, threadId });

  // Retrieving a comment
  const retrievedComment = await getComment(db, commentId);
  console.log('Retrieved Comment:', retrievedComment);
};
