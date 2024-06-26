import {
  brokenCommentsThreadSelector,
  threadPostSelector,
  threadWithZeroCommentsSelector,
} from '../constants/selectors';
import { MyElementNotFoundDOMException } from '../exceptions';
import { validateThreadElementIdOrThrow } from '../validation';

/** Throws DOM exceptions. */
export const getThreadIdFromDom = (): string => {
  const threadElement = document.querySelector<HTMLElement>(threadPostSelector);

  if (!threadElement)
    throw new MyElementNotFoundDOMException(
      'Thread element not found in DOM by attribute.'
    );

  const threadId = validateThreadElementIdOrThrow(threadElement);

  return threadId;
};

export const isZeroCommentsThread = (): boolean =>
  Boolean(document.querySelector<HTMLElement>(threadWithZeroCommentsSelector));

export const isBrokenCommentsThread = (): boolean =>
  Boolean(document.querySelector<HTMLElement>(brokenCommentsThreadSelector));
