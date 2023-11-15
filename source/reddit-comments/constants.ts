/*-------------------------------- Reddit constants ------------------------------*/

/**------------------------------------------------------------------------
 *      Reddit can change these, these can break.
 *      All in a single place.
 *
 *      Store ids in db as in dom, with prefix t1_ - comment, t3_ - thread.
 *      Only for thread url regex.replace()
 *
 *------------------------------------------------------------------------**/

export const redditThreadUrlRegex = /https?:\/\/www\.?reddit\.com\/r\/\w+\/comments\/.+/;

// selectors, easier to select children than parents
export const commentSelector = '[id^="t1_"]:not([id*="-"])';
export const commentIdRegexValidate = /^t1_[a-z0-9]+$/;

export const timestampSelector = '[data-testid="comment_timestamp"]';
export const timestampIdPrefix = 'CommentTopMeta--Created--';

// thread, id="t3_17mmb4o" data-testid="post-container"
export const threadPostSelector = '[data-testid="post-container"]';
export const threadPostIdRegexReplace = /^t3_/; // Only to get url id from element.id
export const threadPostIdRegexValidate = /^t3_[a-z0-9]+$/;

export const numberOfCommentsSelector = '[data-test-id="post-content"]';
export const modalScrollContainerSelector = '#overlayScrollContainer';

/*----------------------------------- My constants ---------------------------------*/

export const isDebug = process.env.IS_DEBUG === 'true' || true;

/** Must reduce number of triggers on scroll */
export const scrollDebounceWait = 1000;

/** Must wait for routing (change page), and load content */
export const urlChangeDebounceWait = 2000;

export const highlightedCommentClass = 'ruc-highlight-comment';

export const databaseName = 'reddit-unread-comments-db';

/** 2 * 10**12 */
export const currentSessionCreatedAt = 2e12 as const;

/*------------------------------ test code, remove later ----------------------------*/

// document
//   .querySelectorAll('[data-testid="comment_timestamp"]')
//   .forEach((el) => console.log(el.id));

// [id^="t1_"]:not([id*="-"])

// document.querySelectorAll('[id^="t1_"]:not([id*="-"])');

// now 1 699 946 225 776
