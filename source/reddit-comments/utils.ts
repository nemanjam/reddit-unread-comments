import { isDebug, redditThreadRegex } from './constants';

export const debug = (...args: any[]) => {
  if (isDebug) console.log(...args);
};

export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;

  const debouncedFunction = function () {
    const args = arguments;
    clearTimeout(timeout);

    timeout = setTimeout(() => func.apply(window, args), wait);
  };

  return debouncedFunction;
};

export const isActiveTab = () => document.visibilityState === 'visible';

export const isRedditThread = () => redditThreadRegex.test(location.href);
