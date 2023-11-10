import { commentSelector } from './constants';

// CommentTopMeta--Created--t1_k8etzzz from t1_k8etzzz
export const getTimestampIdFromCommentId = (commentId: string) => {
  return `CommentTopMeta--Created--${commentId}`;
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

export const highlight = () => {
  // must compare ids for filter
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  // const visibleElements = filterVisibleElements(commentElements);

  commentElements.forEach((commentElement) => {
    commentElement.classList.add('ruc-highlight-comment');
    // console.log('commentElement', commentElement);
    // commentElement.style.border = '2px solid pink';
  });
};
