import { databaseName } from './constants';

const request = indexedDB.open(databaseName, 1);
export let db: IDBDatabase | null = null;

// Create schema
request.onupgradeneeded = (event) => {
  const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

  // Create Thread object store - table
  const threadObjectStore = db.createObjectStore('Thread', {
    keyPath: 'id',
    autoIncrement: true,
  });
  threadObjectStore.createIndex('ThreadIdIndex', 'threadId', { unique: true });
  threadObjectStore.createIndex('UpdatedAtIndex', 'updatedAt', { unique: false });
  threadObjectStore.createIndex('LatestPostIdIndex', 'latestPostId', { unique: false });
  threadObjectStore.createIndex('LatestPostTimestampIndex', 'latestPostTimestamp', {
    unique: false,
  });

  // Create Post object store - table
  const postObjectStore = db.createObjectStore('Post', {
    keyPath: 'id',
    autoIncrement: true,
  });
  postObjectStore.createIndex('PostIdIndex', 'postId', { unique: true });
  postObjectStore.createIndex('ThreadIdIndex', 'threadId', { unique: false });

  // Optionally, create a compound index for postId and threadId as a pseudo-primary key - constraint only
  postObjectStore.createIndex('PostThreadIdIndex', ['postId', 'threadId'], {
    unique: true,
  });
};
