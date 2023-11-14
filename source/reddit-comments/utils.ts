import { isDebug, redditThreadUrlRegex } from './constants';

export const debug = (...args: any[]) => {
  if (isDebug) console.log(...args);
};

export const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;

  const debouncedFunction = function (...args: Parameters<T>) {
    clearTimeout(timeout);

    timeout = setTimeout(() => func.apply(window, args), wait);
  };

  return debouncedFunction;
};

export const isActiveTab = () => document.visibilityState === 'visible';

export const isRedditThread = (url: string): boolean => redditThreadUrlRegex.test(url);

export const hasArrivedToRedditThread = (
  previousUrl: string,
  currentUrl: string
): boolean => !isRedditThread(previousUrl) && isRedditThread(currentUrl);

export const hasLeftRedditThread = (previousUrl: string, currentUrl: string): boolean =>
  isRedditThread(previousUrl) && !isRedditThread(currentUrl);
