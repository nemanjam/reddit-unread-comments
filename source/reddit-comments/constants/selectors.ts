// selectors, easier to select children than parents

// url regex
export const redditThreadUrlRegex = /https?:\/\/www\.?reddit\.com\/r\/\w+\/comments\/.+/;
export const redditUrlRegex = /https?:\/\/www\.?reddit\.com.*/;

// comment
export const commentIdAttribute = 'thingid';
export const commentSelector = 'shreddit-comment[thingid^="t1_"]';
export const getCommentSelectorById = (commentId: string) =>
  `shreddit-comment[thingid^="${commentId}"]`;
export const commentIdRegexValidate = /^t1_[a-z0-9]+$/;

// timestamp
export const getTimestampSelectorById = (commentId: string) => {
  const targetCommentSelector = getCommentSelectorById(commentId);

  // select direct child element first to exclude nested comments
  const timestampSelector = `${targetCommentSelector} > div[slot="commentMeta"] time[datetime]`;
  return timestampSelector;
};

// thread
export const threadPostSelector = 'shreddit-post[id^="t3_"]';
export const threadPostIdRegexReplace = /^t3_/; // Only to get url id from element.id
export const threadPostIdRegexValidate = /^t3_[a-z0-9]+$/;

// header
export const pageHeaderSelector = 'reddit-header-large';

// sort dropdown
// test these
export const sortMenuSelector = 'shreddit-comments-sort-dropdown';
export const sortMenuSpanTextSelector = 'button[id="comment-sort-button"] > span > span';
export const sortByNewMenuItemSelector = 'div[slot="dropdown-items"] data[value="NEW"]';
