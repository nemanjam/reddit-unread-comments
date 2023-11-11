/*-------------------------------- Reddit constants ------------------------------*/

/**------------------------------------------------------------------------
 *      Reddit can change these, these can break.
 *      All in a single place.
 *------------------------------------------------------------------------**/

export const redditThreadUrlRegex = /https?:\/\/www\.?reddit\.com\/r\/\w+\/comments\/.+/;

// selectors, easier to select children than parents
export const commentSelector = '[id^="t1_"]:not([id*="-"])';
export const timestampSelector = '[data-testid="comment_timestamp"]';
export const timestampIdPrefix = 'CommentTopMeta--Created--';

// thread, id="t3_17mmb4o" data-testid="post-container"
export const threadPostSelector = '[data-testid="post-container"]';
export const threadPostIdRegex = /^t3_/;

export const numberOfCommentsSelector = '[data-test-id="post-content"]';
export const modalScrollContainerSelector = '#overlayScrollContainer';

/*----------------------------------- My constants ---------------------------------*/

export const isDebug = process.env.IS_DEBUG === 'true' || true;

/** Must reduce number of triggers on scroll */
export const scrollDebounceWait = 1000;

/** Must wait for routing (change page), and load content */
export const domReadyDebounceWait = 2000;

export const highlightedCommentClass = 'ruc-highlight-comment';

export const databaseName = 'reddit-unread-comments-db';

/*------------------------------ test code, remove later ----------------------------*/

// document
//   .querySelectorAll('[data-testid="comment_timestamp"]')
//   .forEach((el) => console.log(el.id));

// [id^="t1_"]:not([id*="-"])

// document.querySelectorAll('[id^="t1_"]:not([id*="-"])');
