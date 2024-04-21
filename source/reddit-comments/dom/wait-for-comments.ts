import { retryMaxCount, retryTimeout, retryWait } from '../constants/config';
import { isActiveTabAndRedditThreadAndHasComments, wait } from '../utils';

export interface CommentsLoadResult {
  isSuccess: boolean;
  reason: 'has-comments' | 'too-many-retries' | 'timeout' | 'left-thread' | 'unknown';
  elapsedTime: number;
  retryIndex: number;
}

// pass callback for any dom element
export const waitForCommentsToLoad = async (): Promise<CommentsLoadResult> => {
  let result: CommentsLoadResult = {
    isSuccess: false,
    reason: 'unknown',
    elapsedTime: 0,
    retryIndex: 0,
  };

  let retryIndex = 0;
  const startTime = performance.now();

  while (true) {
    retryIndex++;
    const { isOk, isActiveTab, isRedditThread } =
      isActiveTabAndRedditThreadAndHasComments();

    if (isOk) {
      result = {
        isSuccess: true,
        reason: 'has-comments',
        elapsedTime: getElapsedTime(startTime),
        retryIndex,
      };
      break;
    }

    if (!(isActiveTab && isRedditThread)) {
      result = {
        isSuccess: false,
        reason: 'left-thread',
        elapsedTime: getElapsedTime(startTime),
        retryIndex,
      };
      break;
    }

    // select broken comments dom

    // check 0 comments

    if (retryIndex < retryMaxCount) {
      result = {
        isSuccess: false,
        reason: 'too-many-retries',
        elapsedTime: getElapsedTime(startTime),
        retryIndex,
      };
      break;
    }

    const elapsedTime = getElapsedTime(startTime);
    if (elapsedTime + retryWait > retryTimeout) {
      result = {
        isSuccess: false,
        reason: 'timeout',
        elapsedTime,
        retryIndex,
      };
      break;
    }

    // wait at bottom
    await wait(retryWait);
  }

  return result;
};

const getElapsedTime = (startTime: number) => {
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  return elapsedTime;
};
