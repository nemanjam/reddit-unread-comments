/*----------------------------------- My constants ---------------------------------*/

/*---------- url and scroll waiting ---------*/

/** Must reduce number of triggers on scroll */
export const scrollDebounceWait = 1000;

/** Must wait for routing (change page), and load content */
export const urlChangeDebounceWait = 2000;

/** Important for urlChange event. */
export const waitForLocationHrefToUpdate = 1000;

/*------ retry and wait for comments to load -----*/

export const retryMaxCount = 15;

export const retryTimeout = 15 * 1000;

export const retryWait = 1000;

/*----------- sort by new dropdown ----------*/

/** Wait for new comments to reload. */
export const waitAfterSortByNew = 2000;

/** Wait for sort menu to load. */
export const sortMenuWait = 300;

/*------------------ popup -----------------*/

/** Debounce only slider onChange in form. */
export const formSubmitDebounceWait = 300;

export const calcHighlightOnTimeDebounceWait = 300;

/** Refetch every interval. */
export const highlightedCommentsCountInterval = 1000;

export const markAllAsReadDbAndDomWait = 500;

/*--------------- highlighting --------------*/

/** In highlight by read mode, delay to mark as read and un-highlight comments. */
export const markAsReadDelay = 5 * 1000;

/** Increase comment height by 100px. */
export const commentHeightHeadroom = 100;

/*------------- highlight classes ------------*/

export const highlightedCommentClass = 'ruc-highlight-comment';
export const highlightedCommentReadClass = 'ruc-highlight-comment-read';
/** Both read and unread. Don't use.*/
export const allHighlightedCommentsSelector = `.${highlightedCommentClass}, .${highlightedCommentReadClass}`;

export const highlightedCommentByDateClass = 'ruc-highlight-comment-by-date';

/*------------------ datetime -----------------*/

/** Offset in seconds to fix Date comparison 1hr > 1hr and prevent flicker. */
export const dateCorrectionOffset = 30 as const;

/*------------------ database -----------------*/

export const databaseName = 'reddit-unread-comments-db';

/** 2 * 10**12 */
export const currentSessionCreatedAt = 2e12 as const;

/*--------------- database limits --------------*/

/** Start deleting at. */
export const dbSizeLimit: number = 1 * 1024 * 1024; // 1 MB limit
/** Bring to this size. */
export const dbTargetSize: number = 0.5 * 1024 * 1024; // 0.5 MB target size
