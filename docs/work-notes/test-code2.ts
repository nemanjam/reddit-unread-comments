

const commentId = 't1_kznmxco';

const commentSelector = 'shreddit-comment[thingid^="t1_"]';

const getCommentSelectorById = (commentId) => `shreddit-comment[thingid^="${commentId}"]`;

const getTimestampSelectorById = (commentId) => {
  const targetedCommentSelector = getCommentSelectorById(commentId);
  // avoid nested comments
  const timestampSelector = `${targetedCommentSelector} *:not(${commentSelector}) time:first-child[datetime]`;
  return timestampSelector;
};

const timestampSelector = getTimestampSelectorById(commentId);

document.querySelectorAll(timestampSelector);

document.querySelectorAll(
  'shreddit-comment[thingid^="t1_kznmxco"] :not(shreddit-comment) time:first-child[datetime]'
);

document.querySelectorAll(
  'shreddit-comment[thingid^="t1_kznmxco"] > div[slot="commentMeta"] time'
);


document.querySelectorAll('shreddit-comment[thingid^="t1_kzklld1"]');
document.querySelector(
  'shreddit-comment[thingid^="t1_kzklld1"] time:first-child[datetime]'
);