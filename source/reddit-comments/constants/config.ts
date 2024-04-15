/*----------------------------------- My constants ---------------------------------*/

export const isDebug = process.env.IS_DEBUG === 'true';

/** Must reduce number of triggers on scroll */
export const scrollDebounceWait = 1000;

/** Must wait for routing (change page), and load content */
export const urlChangeDebounceWait = 2000;
export const waitAfterSortByNew = 2000;

/** Debounce only slider onChange in form. */
export const formSubmitDebounceWait = 300;

export const calcHighlightOnTimeDebounceWait = 300;

/** In realtime mode, delay to mark as read and un-highlight comments. */
export const markAsReadDelay = 5 * 1000;

/** Increase comment height by 100px. */
export const commentHeightHeadroom = 100;

/** Wait for sort menu to load. */
export const sortMenuWait = 300;

/** Refetch every interval. */
export const highlightedCommentsCountInterval = 1000;

export const highlightedCommentClass = 'ruc-highlight-comment';
export const highlightedCommentReadClass = 'ruc-highlight-comment-read';
/** Both read and unread. Don't use.*/
export const allHighlightedCommentsSelector = `.${highlightedCommentClass}, .${highlightedCommentReadClass}`;

export const highlightedCommentByDateClass = 'ruc-highlight-comment-by-date';

export const databaseName = 'reddit-unread-comments-db';

/** 2 * 10**12 */
export const currentSessionCreatedAt = 2e12 as const;

/** Offset in seconds to fix Date comparison 1hr > 1hr and prevent flicker. */
export const dateCorrectionOffset = 30 as const;

// tested
/** Start deleting at. */
export const dbSizeLimit: number = 1 * 1024 * 1024; // 1 MB limit
/** Bring to this size. */
export const dbTargetSize: number = 0.5 * 1024 * 1024; // 0.5 MB target size
