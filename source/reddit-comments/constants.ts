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
export const timestampIdModalSuffix = 'inOverlay';

// thread, id="t3_17mmb4o" data-testid="post-container"
export const threadPostSelector = '[data-testid="post-container"]';
/** thread post in modal thread, unused */
export const threadPostModalSelector =
  '#overlayScrollContainer [data-testid="post-container"]';
export const threadPostIdRegexReplace = /^t3_/; // Only to get url id from element.id
export const threadPostIdRegexValidate = /^t3_[a-z0-9]+$/;

export const numberOfCommentsSelector = '[data-test-id="post-content"]';
export const modalScrollContainerSelector = '#overlayScrollContainer';

export const pageHeaderSelector = 'header';
export const modalHeaderSelector = '#overlayScrollContainer > :first-child';

export const sortMenuSelector = '#CommentSort--SortPicker';
export const sortMenuSpanTextSelector = '#CommentSort--SortPicker > span';
export const sortByNewMenuItemSelector = '[role="menuitem"] > button > span';

/*----------------------------------- My constants ---------------------------------*/

export const isDebug = process.env.IS_DEBUG === 'true' || true;

/** Must reduce number of triggers on scroll */
export const scrollDebounceWait = 1000;

/** Must wait for routing (change page), and load content */
export const urlChangeDebounceWait = 2000;

/** Debounce only slider onChange in form. */
export const formSubmitDebounceWait = 300;

/** In realtime mode, delay to mark as read and un-highlight comments. */
export const markAsReadDelay = 5 * 1000;

/** Wait for sort menu to load. */
export const sortMenuWait = 300;

export const highlightedCommentClass = 'ruc-highlight-comment';
export const highlightedCommentReadClass = 'ruc-highlight-comment-read';
/** Both read and unread. Don't use.*/
export const allHighlightedCommentsSelector = `.${highlightedCommentClass}, .${highlightedCommentReadClass}`;

export const highlightedCommentByDateClass = 'ruc-highlight-comment-by-date';

export const databaseName = 'reddit-unread-comments-db';

/** 2 * 10**12 */
export const currentSessionCreatedAt = 2e12 as const;

// export const dbSizeLimit: number = 6 * 1024 * 1024; // 6MB limit
// export const dbTargetSize: number = 5 * 1024 * 1024; // 5MB target size

export const dbSizeLimit: number = 400;
export const dbTargetSize: number = 300;

/*------------------------------ test code, remove later ----------------------------*/

//0.000434 MB, dbSizeLimit: 6.000000 MB.

// 1 699 867 623 577 // 2066

// document
//   .querySelectorAll('[data-testid="comment_timestamp"]')
//   .forEach((el) => console.log(el.id));

// [id^="t1_"]:not([id*="-"])

// document.querySelectorAll('[id^="t1_"]:not([id*="-"])');

// now 1 699 946 225 776
