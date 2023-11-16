import { MyElementIdNotValidDOMException } from './exceptions';
import { commentIdRegexValidate, threadPostIdRegexValidate } from './constants';

/** Returns boolean. */
export const validateThreadId = (threadId: string): boolean =>
  threadPostIdRegexValidate.test(threadId);

export const validateCommentId = (commentId: string): boolean =>
  commentIdRegexValidate.test(commentId);

/** Returns id or throws. */
export const validateThreadElementIdOrThrow = (threadElement: HTMLElement): string => {
  if (!validateThreadId(threadElement.id))
    throw new MyElementIdNotValidDOMException(`Invalid Thread.id: ${threadElement.id}`);
  return threadElement.id;
};

export const validateCommentElementIdOrThrow = (commentElement: HTMLElement): string => {
  if (!validateCommentId(commentElement.id))
    throw new MyElementIdNotValidDOMException(`Invalid Comment.id: ${commentElement.id}`);
  return commentElement.id;
};
