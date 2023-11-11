import { commentSelector, highlightedCommentClass, timestampIdPrefix } from './constants';

// CommentTopMeta--Created--t1_k8etzzz from t1_k8etzzz
export const getTimestampIdFromCommentId = (commentId: string) =>
  timestampIdPrefix + commentId;

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
  commentElements.forEach((commentElement) => {
    if (isElementInViewport(commentElement)) {
      const timestampId = getTimestampIdFromCommentId(commentElement.id);
      const timestampElement = document.querySelector<HTMLElement>(`#${timestampId}`);

      // check time
      // add comment id in db

      console.log('in viewport', timestampElement?.textContent);
    }
  });
};

export const traverseComments = () => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);

  markAsRead(commentElements);
  highlight(commentElements);
};
