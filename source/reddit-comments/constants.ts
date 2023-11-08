export const redditThreadRegex =
  /https?:\/\/(www\.)?reddit\.com\/r\/(\w+)\/comments\/([^/]+)/;

export const timestampSelector = '[data-testid="comment_timestamp"]';

export const isDebug = process.env.IS_DEBUG === 'true' || true;

export const debounceWait = 2000;
