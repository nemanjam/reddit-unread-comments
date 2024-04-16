import {
  commentHeightHeadroom,
  highlightedCommentByDateClass,
  highlightedCommentClass,
  highlightedCommentReadClass,
} from '../constants/config';
import { commentSelector } from '../constants/selectors';
import { validateCommentElementIdOrThrow } from '../validation';

// sync, fix for big comments
export const isElementInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const elementHeight = commentHeightHeadroom + (rect.bottom - rect.top);

  const isInViewport =
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);

  const isHigherThanViewportAndVisible =
    elementHeight > window.innerHeight &&
    (rect.top >= 0 ||
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight));

  const result = isInViewport || isHigherThanViewportAndVisible;
  return result;
};

export const addClass = (element: HTMLElement, className: string): void => {
  if (!element.classList.contains(className)) element.classList.add(className);
};

export const removeClass = (element: HTMLElement, className: string): void => {
  if (element.classList.contains(className)) element.classList.remove(className);
};

export const removeHighlightClass = () => {
  const highlightedElements = document.querySelectorAll<HTMLElement>(
    `.${highlightedCommentClass}`
  );
  highlightedElements.forEach((commentElement) => {
    commentElement.classList.remove(highlightedCommentClass);
  });
};

export const removeHighlightReadClass = () => {
  const highlightedReadElements = document.querySelectorAll<HTMLElement>(
    `.${highlightedCommentReadClass}`
  );
  highlightedReadElements.forEach((commentElement) => {
    commentElement.classList.remove(highlightedCommentReadClass);
  });
};

export const removeHighlightByDateClass = () => {
  const highlightedElementsByDate = document.querySelectorAll<HTMLElement>(
    `.${highlightedCommentByDateClass}`
  );
  highlightedElementsByDate.forEach((commentElement) => {
    commentElement.classList.remove(highlightedCommentByDateClass);
  });
};

export const calcHighlightedByDateCount = (): number => {
  const highlightedElementsByDate = document.querySelectorAll<HTMLElement>(
    `.${highlightedCommentByDateClass}`
  );
  return highlightedElementsByDate.length;
};

export const calcHighlightedUnreadCount = (): number => {
  const highlightedElementsUnread = document.querySelectorAll<HTMLElement>(
    `.${highlightedCommentClass}`
  );
  return highlightedElementsUnread.length;
};

export const getAllComments = (): NodeListOf<HTMLElement> => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  return commentElements;
};

export const getAllCommentsIds = (): string[] => {
  const commentElements = getAllComments();
  const commentIds = Array.from(commentElements).map((commentElement) =>
    validateCommentElementIdOrThrow(commentElement)
  );
  return commentIds;
};
