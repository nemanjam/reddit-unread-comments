# Users note

Here is documented all of the features of the extension and how you can get the most of it as an user.

## 1. General overview

The extension is completely free and open source using MIT license. It is privacy aware, runs completely client side and no data ever leaves your browser and no user activity or data is tracked. It is completely unobtrusive to the existing Reddit's website behavior, you wont notice any changes in the website behavior and performance. Also it runs only in `reddit.com` pages and any other domain is intact and doesn't load the extension code.

First you need to be logged in with Reddit account because Reddit DOM is different for signed in and not signed in users. Second, you need to navigate to Reddit thread to be able to load User Settings popup where you can adjust settings to your preference.

## 2. Highlighting comments

Highlighting has two modes:

a. It can highlight unread comments. Comment's body is highlighted in red. Extension tracks comments that were in your viewport and saves them to database, then it highlights only unread comments. Un-highlighting comments (marking them as read) can happen onScroll after 5 seconds being visible in viewport or onUrlChange when you navigate away and back to the thread. You can choose between these two options in User Settings popup. This is possible because the extension tracks sessions too and makes difference between the current session and all previous sessions. After a comment from the current session is un-highlighted it still has highlight onHover for easier identification. This highlighting mode is good for threads that you track closely and don't want to miss anything.

b. It can highlight based on the time of the comment. Comment's timestamp is highlighted in yellow. Reddit prints approximate timestamp in each comment and you can filter them in the User Settings popup with slider and radio controls and highlight only the newer timestamps. This mode is convenient for new threads and the ones that you don't track closely and just want to quickly glance only through the most recent comments.

For both modes you can see the current counts of highlighted comments in realtime.

## 3. Scrolling

You can quickly scroll through the comments with `Ctrl + Space` that will scroll to the next page of unread comments. Page consists of all comments that are visible in the viewport at once. You can reset scroll by scrolling to the first page of comments by using `Ctrl + Shift + Space`.

You can scroll only unread or highlighted by time comments or both. You can set that also in the user Settings popup. 

## 4. Sort all threads `By New` by default

Reddit has default sort different in each subreddit (`By Best` is default in most of the subreddits). If you don't like this and want all threads in all subreddit to just be sorted chronologically `By New` by default you can check the `Sort all threads by new` switch in the User Settings popup and it will do it for you. Please note this will increase loading time because the comments will load twice. Although the threads tha already have default sort `By New` will be unaffected.

## 5. Logging

You can enable or disable logging to browser console. This can be useful for debugging when reporting bugs.

## 6. Reset Threads and Users Setting

If you just want to reset read history for a specific thread or all threads and start from scratch you can do that with radio and Reset button in the User Settings popup. You can also reset the User Settings popup form to the default settings with radio and Reset button.

## 7. Limiting IndexedDB database size

All data for both comments history and user settings are stored locally in the browser in the IndexedDB database. Browser limit is around 50 MB. The extension will auto check on each new thread that the database isn't bigger than 1 MB and if it is it will reduce it size to 0.5 MB by deleting the history for the oldest threads. This way you don't have ever to worry that it will exhaust your browser storage space and to reset things manually. 

## 8. User Settings popup

Popup loads only when you navigate to a Reddit thread because its controls only make sense there. Important note is that all changes in the popup form are reflected **immediately** which should contribute to the pleasant user experience.
