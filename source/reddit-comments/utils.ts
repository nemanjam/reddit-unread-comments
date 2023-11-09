import { isDebug } from './constants';

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

export const isActiveTab = () => document.visibilityState === 'visible';
