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
  const visibleElements: HTMLElement[] = [];

  // MUST work with original NodeList.forEach
  elements.forEach((element) =>
    isElementInViewport(element, (isVisible) => {
      if (isVisible) visibleElements.push(element);
    })
  );

  return visibleElements;

  // console.log('==============', 'visibleElements.length:', visibleElements.length);
  // console.log('==============', 'visibleElements', visibleElements);

  // const selector = visibleElements.map((element) => {
  //   console.log('element', element);
  //   // return `#${element.id}`;
  // }).join(',');
  // console.log('selector', selector);

  // const selectedElements = document.querySelectorAll(selector);
  // return selectedElements;
};

export const highlight = () => {
  const commentElements = document.querySelectorAll<HTMLElement>(commentSelector);
  // const visibleElements = filterVisibleElements(commentElements);

  commentElements.forEach((commentElement) => {
    commentElement.classList.add('ruc-highlight-comment');
    // console.log('commentElement', commentElement);
    // commentElement.style.border = '2px solid pink';
  });
};
