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

export const delayExecution = async <T extends any[]>(
  func: (...args: T) => Promise<void>,
  wait: number,
  ...args: T
): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(async () => {
      await func(...args);
      resolve();
    }, wait);
  });

export const isActiveTab = () => document.visibilityState === 'visible';

export const isRedditThread = (url: string): boolean => redditThreadUrlRegex.test(url);

export const hasArrivedToRedditThread = (
  previousUrl: string,
  currentUrl: string
): boolean => !isRedditThread(previousUrl) && isRedditThread(currentUrl);

export const hasLeftRedditThread = (previousUrl: string, currentUrl: string): boolean =>
  isRedditThread(previousUrl) && !isRedditThread(currentUrl);

export const sizeInMBString = (sizeInBytes: number): string =>
  (sizeInBytes / (1024 * 1024)).toFixed(6);

/** Sort comments by new. */
export const getSortByNewUrl = (url: string): string => {
  if (!isRedditThread(url)) return url;

  const urlObject = new URL(url);
  const queryParams = new URLSearchParams(urlObject.search);

  if (queryParams.has('sort')) {
    if (queryParams.get('sort') === 'new') return url;

    queryParams.set('sort', 'new');
  } else {
    queryParams.append('sort', 'new');
  }

  urlObject.search = queryParams.toString();

  return urlObject.toString();
};

export const hasSortByNewQueryParam = (url: string): boolean => {
  const urlObject = new URL(url);
  const queryParams = new URLSearchParams(urlObject.search);

  return queryParams.has('sort') && queryParams.get('sort') === 'new';
};
