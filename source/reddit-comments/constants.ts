export const redditThreadRegex =
  /https?:\/\/(www\.)?reddit\.com\/r\/(\w+)\/comments\/([^/]+)/;

export const timestampSelector = '[data-testid="comment_timestamp"]';

// export const captureCommentIdFromTimestampIdRegex =
//   /(?:CommentTopMeta--Created--)(t1_[a-z0-9]+)(?:inOverlay)/;

export const captureCommentIdFromTimestampIdRegex =
  /(?:CommentTopMeta--Created--)(t1_[a-z0-9]+)/;

export const isDebug = process.env.IS_DEBUG === 'true' || true;

export const debounceWait = 2000;

// document
//   .querySelectorAll('[data-testid="comment_timestamp"]')
//   .forEach((el) => console.log(el.id));
