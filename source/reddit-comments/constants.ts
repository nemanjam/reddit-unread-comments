export const redditThreadRegex =
  /https?:\/\/(www\.)?reddit\.com\/r\/(\w+)\/comments\/([^/]+)/;

// selectors, easier to select children than parents
export const commentSelector = '[id^="t1_"]:not([id*="-"])';
export const timestampSelector = '[data-testid="comment_timestamp"]';

export const captureCommentIdFromTimestampIdRegex =
  /(?:CommentTopMeta--Created--)(t1_[a-z0-9]+)/;

export const isDebug = process.env.IS_DEBUG === 'true' || true;

export const scrollDebounceWait = 2000;
export const domReadyDebounceWait = 2;

// document
//   .querySelectorAll('[data-testid="comment_timestamp"]')
//   .forEach((el) => console.log(el.id));

// [id^="t1_"]:not([id*="-"])

// document.querySelectorAll('[id^="t1_"]:not([id*="-"])');
