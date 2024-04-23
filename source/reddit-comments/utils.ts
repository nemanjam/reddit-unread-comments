import { redditThreadUrlRegex, redditUrlRegex } from './constants/selectors';
import { SettingsData, SettingsDataKeys } from './database/schema';
import { getAllComments } from './dom/highlight-common';
import debounce from 'lodash.debounce';

export type AnyFunction = (...args: any[]) => any;

export const debounceLeading = (func: AnyFunction, wait: number) =>
  debounce(func, wait, { leading: true, trailing: false });

export const debounceTrailing = (func: AnyFunction, wait: number) =>
  debounce(func, wait, { leading: false, trailing: true });

export const isActiveTab = () => document.visibilityState === 'visible';

export const isRedditSite = (url: string): boolean => redditUrlRegex.test(url);

export const isRedditThread = (url: string): boolean => redditThreadUrlRegex.test(url);

export const isRedditThreadWithHref = (): boolean => isRedditThread(location.href);

export const isActiveTabAndRedditThread = (): boolean =>
  isActiveTab() && isRedditThreadWithHref();

export const isActiveTabAndRedditThreadAndHasComments = () => {
  const isActiveTabValue = isActiveTab();
  const isRedditThread = isRedditThreadWithHref();

  const commentElements = getAllComments();
  const hasComments = commentElements.length > 0;

  const result = {
    isActiveTab: isActiveTabValue,
    isRedditThread,
    hasComments,
    commentElements,
    isOk: isActiveTabValue && isRedditThread && hasComments,
  };

  return result;
};

export const hasArrivedToRedditThread = (
  previousUrl: string,
  currentUrl: string
): boolean => !isRedditThread(previousUrl) && isRedditThread(currentUrl);

export const hasLeftRedditThread = (previousUrl: string, currentUrl: string): boolean =>
  isRedditThread(previousUrl) && !isRedditThread(currentUrl);

export const sizeInMBString = (sizeInBytes: number): string =>
  (sizeInBytes / (1024 * 1024)).toFixed(6);

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

export const getElapsedTime = (startTime: number) => {
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  return elapsedTime;
};

/** for debugging */
export class MeasureTime {
  private static startTimeInitial = 0;
  private static startTime = MeasureTime.startTimeInitial;

  static setStartTime(startTime: number) {
    MeasureTime.startTime = startTime;
  }

  static getElapsedTime() {
    if (MeasureTime.startTime === MeasureTime.startTimeInitial) {
      throw new Error(`startTime not set, startTime: ${MeasureTime.startTime}`);
    }

    const endTime = performance.now();
    const elapsedTime = endTime - MeasureTime.startTime;
    return elapsedTime;
  }
}
