import { defaultRetryOptions, RetryOptions } from '../constants/config';
import { getElapsedTime, isActiveTabAndRedditThreadAndHasComments, wait } from '../utils';
import { isZeroCommentsThread } from './thread';

export interface RetryAndWaitResult {
  /** if should proceed with highlight */
  isSuccess: boolean;
  reason:
    | 'has-comments'
    | 'too-many-retries'
    | 'timeout'
    | 'left-thread'
    | 'zero-comments'
    | 'initial';
  elapsedTime: number;
  retryIndex: number;
}

export type RetryAndWaitCallbackResult = Pick<RetryAndWaitResult, 'reason' | 'isSuccess'>;
export type RetryAndWaitCallback = () => RetryAndWaitCallbackResult;

export const waitForCommentsCallback: RetryAndWaitCallback = () => {
  let result: RetryAndWaitCallbackResult = {
    isSuccess: false,
    reason: 'initial',
  };

  // check 0 comments
  const hasZeroComments = isZeroCommentsThread();

  if (hasZeroComments) {
    result = {
      isSuccess: false,
      reason: 'zero-comments',
    };
  }

  // select broken comments dom

  const { isOk, isActiveTab, isRedditThread } =
    isActiveTabAndRedditThreadAndHasComments();

  if (isOk) {
    result = {
      isSuccess: true,
      reason: 'has-comments',
    };
  }

  if (!(isActiveTab && isRedditThread)) {
    result = {
      isSuccess: false,
      reason: 'left-thread',
    };
  }

  return result;
};

export const retryAndWaitForCommentsToLoad = () =>
  retryAndWaitForElementToLoad(waitForCommentsCallback);

// pass callback for any dom element
export const retryAndWaitForElementToLoad = async (
  callback: RetryAndWaitCallback,
  retryOptionsArg?: RetryOptions
): Promise<RetryAndWaitResult> => {
  const retryOptions = { ...defaultRetryOptions, ...retryOptionsArg };

  let result: RetryAndWaitResult = {
    isSuccess: false,
    reason: 'initial',
    elapsedTime: 0,
    retryIndex: 0,
  };

  let retryIndex = 0;
  const startTime = performance.now();

  while (true) {
    retryIndex++;

    const callbackResult = callback();

    if (callbackResult.reason !== 'initial') {
      result = {
        ...callbackResult,
        elapsedTime: getElapsedTime(startTime),
        retryIndex,
      };
      break;
    }

    if (retryIndex > retryOptions.maxCount) {
      result = {
        isSuccess: false,
        reason: 'too-many-retries',
        elapsedTime: getElapsedTime(startTime),
        retryIndex,
      };
      break;
    }

    const elapsedTime = getElapsedTime(startTime);
    if (elapsedTime + retryOptions.wait > retryOptions.timeout) {
      result = {
        isSuccess: false,
        reason: 'timeout',
        elapsedTime,
        retryIndex,
      };
      break;
    }

    // wait at bottom
    await wait(retryOptions.wait);
  }

  return result;
};
