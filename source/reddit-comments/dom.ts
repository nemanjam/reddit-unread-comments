import { commentSelector } from './constants';

// CommentTopMeta--Created--t1_k8etzzz from t1_k8etzzz
export const getTimestampIdFromCommentId = (commentId: string) => {
  return `CommentTopMeta--Created--${commentId}`;
};

export const isElementInViewport = (
  element: HTMLElement,
  callback: (isVisible: boolean) => void
): void => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(true);
        observer.disconnect();
      } else {
        callback(false);
      }
    });
  });

  observer.observe(element);
};

export const filterVisibleElements = (elements: NodeListOf<HTMLElement>) => {
  const elementArray = Array.from(elements);
  const visibleElements: HTMLElement[] = [];

  elementArray.forEach((element) =>
    isElementInViewport(element, (isVisible) => {
      if (isVisible) visibleElements.push(element);
    })
  );

  return visibleElements;
};

export const highlight = () => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  // const visibleElements = filterVisibleElements(commentElements);
  // console.log('visibleElements', visibleElements.length, visibleElements);

  commentElements.forEach((commentElement) => {
    commentElement.classList.add('ruc-highlight-comment');
    // console.log('commentElement', commentElement);
    // commentElement.style.border = '2px solid pink';
  });
};
