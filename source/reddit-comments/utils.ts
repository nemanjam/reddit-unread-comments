import { isDebug, redditThreadUrlRegex } from './constants';

export const debug = (...args: any[]) => {
  if (isDebug) console.log(...args);
};

export const debounce = <T extends (...args: any[]) => Promise<void>>(
  func: T,
  wait: number
) => {
  let timeout: NodeJS.Timeout;
  let resolveFn: (() => void) | null = null;

  const debouncedFunction = async function (...args: Parameters<T>) {
    clearTimeout(timeout);

    return new Promise<void>((resolve) => {
      resolveFn = resolve;
      timeout = setTimeout(async () => {
        await func.apply(window, args);
        if (resolveFn) {
          resolveFn();
          resolveFn = null;
        }
      }, wait);
    });
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
