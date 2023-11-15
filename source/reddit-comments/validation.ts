import { MyElementIdNotValidDOMException } from './exceptions';
import { commentIdRegexValidate, threadPostIdRegexValidate } from './constants';

/** Returns boolean. */
export const validateThreadId = (threadId: string): boolean =>
  threadPostIdRegexValidate.test(threadId);

export const validateCommentId = (commentId: string): boolean =>
  commentIdRegexValidate.test(commentId);

export const validateThreadElementIdOrThrow = (threadElement: HTMLElement): string => {
  if (!validateThreadId(threadElement.id))
    throw new MyElementIdNotValidDOMException('Invalid Thread.id.');
  return threadElement.id;
};

export const validateCommentElementIdOrThrow = (commentElement: HTMLElement): string => {
  if (!validateThreadId(commentElement.id))
    throw new MyElementIdNotValidDOMException('Invalid Comment.id.');
  return commentElement.id;
};
