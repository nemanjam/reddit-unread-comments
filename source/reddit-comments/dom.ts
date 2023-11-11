import {
  commentSelector,
  highlightedCommentClass,
  threadPostIdRegex,
  threadPostSelector,
  timestampIdPrefix,
} from './constants';

// CommentTopMeta--Created--t1_k8etzzz from t1_k8etzzz
export const getTimestampIdFromCommentId = (commentId: string) =>
  timestampIdPrefix + commentId;

export const getThreadId = (): string | null => {
  const threadElement = document.querySelector<HTMLElement>(threadPostSelector);

  const threadId =
    threadElement && threadPostIdRegex.test(threadElement.id)
      ? threadElement.id.replace(threadPostIdRegex, '')
      : null;

  return threadId;
};

// sync
const isElementInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// only elements with ids
export const filterVisibleElements = (elements: NodeListOf<HTMLElement>) => {
  const visibleElements: HTMLElement[] = [];

  // MUST work with original NodeList.forEach
  elements.forEach((element) => {
    if (isElementInViewport(element)) visibleElements.push(element);
  });

  const selector = visibleElements.map((element) => `#${element.id}`).join(',');

  const selectedElements = document.querySelectorAll(selector);
  return selectedElements;
};

const highlight = (commentElements: NodeListOf<HTMLElement>) => {
  // compare with db
  commentElements.forEach((commentElement) => {
    commentElement.classList.add(highlightedCommentClass);
  });
};

const markAsRead = (commentElements: NodeListOf<HTMLElement>) => {
  const threadId = getThreadId();

  commentElements.forEach((commentElement) => {
    if (isElementInViewport(commentElement)) {
      const timestampId = getTimestampIdFromCommentId(commentElement.id);
      const timestampElement = document.querySelector<HTMLElement>(`#${timestampId}`);
      const timestamp = timestampElement?.textContent;

      // check time
      // add comment id in db
    }
  });
};

export const traverseComments = () => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);

  markAsRead(commentElements);
  highlight(commentElements);
};
