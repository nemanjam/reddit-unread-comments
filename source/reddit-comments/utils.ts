import {
  isDebug,
  timestampSelector,
  captureCommentIdFromTimestampIdRegex,
} from './constants';

export const debug = (...args: any[]) => {
  if (isDebug) console.log(...args);
};

export const debounce = (func: Function, wait: number) => {
  let timeout: any;

  return function () {
    const args = arguments;
    clearTimeout(timeout);

    timeout = setTimeout(() => func.apply(window, args), wait);
  };
};

// t1_k8etzzz from CommentTopMeta--Created--t1_k8etzzzinOverlay
// t1_k8etzzz from CommentTopMeta--Created--t1_k8etzzz // actually this
export const getCommentIdFromTimestampId = (timestampId: string) => {
  const match = timestampId.match(captureCommentIdFromTimestampIdRegex);

  if (match) {
    const extractedString = match[1];
    return extractedString;
  }

  return null;
};

export const getCommentElementFromTimestampElement = (timestampElement: HTMLElement) => {
  const commentId = getCommentIdFromTimestampId(timestampElement.id);
  const commentElement = document.querySelector<HTMLElement>(`#${commentId}`);
  return commentElement;
};

export const highlight = () => {
  const timestampElements = document.querySelectorAll<HTMLElement>(timestampSelector);
  timestampElements.forEach((timestampElement) => {
    const commentElement = getCommentElementFromTimestampElement(timestampElement);
    if (!commentElement) return;

    commentElement.classList.add('ruc-highlight-comment');

    // commentElement.style.border = '2px solid pink';'
    // element.style.border = '2px solid blue';
  });

  debug(`Highlighting, timestampElements.length: ${timestampElements.length}`);
};

export const isActiveTab = () => document.visibilityState === 'visible';

export const findClosestParent = (
  startingElement: Node,
  selector: string
): Node | null => {
  let currentElement: Node | null = startingElement;

  while (currentElement && currentElement !== document) {
    currentElement = currentElement.parentNode;

    if (!(currentElement instanceof Element)) {
      continue;
    }

    if (currentElement.matches(selector)) {
      return currentElement;
    }
  }

  return null;
};
