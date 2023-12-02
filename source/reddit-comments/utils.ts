import { isDebug, redditThreadUrlRegex } from './constants';
import { SettingsData, SettingsDataKeys } from './database/schema';

export type AnyFunction = (...args: any[]) => any;

export const debounce = (func: AnyFunction, wait: number) => {
  let timeout: NodeJS.Timeout;
  let resolveFn: (() => void) | null = null;

  const debouncedFunction: AnyFunction = function (...args: any[]) {
    clearTimeout(timeout);

    return new Promise<void>((resolve) => {
      resolveFn = resolve;
      timeout = setTimeout(async () => {
        const result = func.apply(window, args);

        if (result instanceof Promise) {
          await result;
        }

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

export const pickShallow = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const picked: Partial<Pick<T, K>> = {};
  keys.forEach((key) => {
    picked[key] = obj[key];
  });
  return picked as Pick<T, K>;
};

export const detectChanges = (object1: SettingsData, object2: SettingsData): string[] => {
  const changes: string[] = [];

  for (const _key in object1) {
    const key = _key as SettingsDataKeys;

    if (object1.hasOwnProperty(key) && object1[key] !== object2[key]) {
      changes.push(key);
    }
  }

  return changes;
};

export const wait = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
