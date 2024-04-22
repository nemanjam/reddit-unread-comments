

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


{
  "__@virtualstate/navigation/key": {
    "__@virtualstate/navigation/meta": true,
    "currentIndex": 2,
    "key": "9d9a9f58-b440-45ce-a845-790cc6ca92f6",
    "entries": [
      {
        "id": "76b406fd-8adc-4c47-affa-54109584b9a6",
        "key": "4c03bb89-03a1-4979-9042-9c8627a8533b",
        "url": "https://www.reddit.com/r/AskSerbia/comments/1c8vef2/najbolji_primeri_upotrebe_dvostrane_lepljive_trake/",
        "sameDocument": true
      },
      {
        "id": "f9231630-0b04-4a3d-a944-acd23e2d1658",
        "key": "200481fc-44b4-47a0-992d-66aafc23f1a2",
        "url": "https://www.reddit.com/r/AskSerbia/",
        "sameDocument": true
      },
      {
        "id": "ec59cd16-5b03-49d5-b5b2-fe74f500a33f",
        "key": "9d9a9f58-b440-45ce-a845-790cc6ca92f6",
        "url": "https://www.reddit.com/r/AskSerbia/comments/1c8q5ds/pismeni_iz_engleskog/",
        "sameDocument": true
      }
    ]
  }
}

export const old_debounce = (func: AnyFunction, wait: number) => {
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


