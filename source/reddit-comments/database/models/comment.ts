import { CommentData, Comment } from '../schema';

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
