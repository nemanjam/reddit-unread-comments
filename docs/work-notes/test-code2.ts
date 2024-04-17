

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

const shadowHost = document.getElementById('shadow-host');
const shadowRoot = shadowHost.getRootNode();
const buttonInsideShadow = shadowRoot.querySelector('button');
buttonInsideShadow.click();


document.querySelector('shreddit-sort-dropdown').click()


document.querySelector('#comment-sort-button').click()


document.querySelectorAll('shreddit-sort-dropdown')



var shadowHost = document.querySelector('shreddit-sort-dropdown');
var buttonInsideShadow = shadowHost.shadowRoot.querySelector('button[id="comment-sort-button"] > span > span');
buttonInsideShadow.textContent

buttonInsideShadow.click();


document.querySelector('button[id="comment-sort-button"]');


document.querySelector('data[value="NEW"]').click()

document.querySelector('#main-content').click()

-------------

var currentElement = document.querySelector('shreddit-comment[thingid^="t1_kz4bckd"]')
var contentElement = currentElement.querySelector('shreddit-comment[thingid^="t1_kz4bckd"] > div[slot="comment"]')
contentElement;



