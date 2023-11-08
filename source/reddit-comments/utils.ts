import { isDebug, timestampSelector } from './constants';

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

export const highlight = () => {
  const timestampElements = document.querySelectorAll<HTMLElement>(timestampSelector);
  timestampElements.forEach((element) => {
    // element.classList.add('ruc-highlight-comment');
    element.style.border = '2px solid blue';
  });

  debug(`Highlighting, timestampElements.length: ${timestampElements.length}`);
};
