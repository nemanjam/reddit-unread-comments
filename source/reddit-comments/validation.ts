import { MyElementIdNotValidDOMException } from './exceptions';
import { commentIdRegexValidate, threadPostIdRegexValidate } from './constants';
import { commentIdAttribute } from './constants/selectors';

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
  const commentId = commentElement.getAttribute(commentIdAttribute);

  if (!(commentId && validateCommentId(commentId)))
    throw new MyElementIdNotValidDOMException(`Invalid Comment.thingid: ${commentId}`);

  return commentId;
};
