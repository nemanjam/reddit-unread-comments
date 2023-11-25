import {
  currentSessionCreatedAt,
  databaseName,
  dbSizeLimit,
  dbTargetSize,
} from '../constants';
import { sizeInMBString } from '../utils';

export interface ThreadData {
  id?: number;
  threadId: string;
  updatedAt: number;
  latestCommentId?: string;
  /** In db store as numeric timestamp. App works with Date. */
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

export const Thread = {
  ThreadObjectStore: 'Thread',
  ThreadIdIndex: 'ThreadIdIndex',
  UpdatedAtIndex: 'UpdatedAtIndex',
  LatestCommentIdIndex: 'LatestCommentIdIndex',
  LatestCommentTimestampIndex: 'LatestCommentTimestampIndex',
} as const;

export const Comment = {
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
