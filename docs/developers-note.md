# Developers note

Here are documented interesting technical challenges that I faced while developing this extension, it can help you understand this codebase and technical decisions much faster compared to just reviewing the code.

## 1. Starter project for Firefox/Chrome extensions

Research on Github led me to two repositories that have most to offer but are still not perfect and complete, it's these two:

[abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter)

[aeksco/react-typescript-web-extension-starter](https://github.com/aeksco/react-typescript-web-extension-starter)

The first one is 3 years outdated, React `v17`, Webpack `v4`, has no Tailwind but still more complete. The second one is a bit newer, has Tailwind but unusable because significantly incomplete. I chose the first one, added Tailwind and RadixUI Themes and updated only what I had to to use features that I want, my goal was to make a Reddit extension, not to lose myself into making up to date comprehensive browser extension starter which requires lot of research and time on its own.

## 2. Analyze Reddit website

This was interesting task and mandatory to make correct design decisions for optimal functioning of the extension, but again not spend too much time in reversing things and never write any practical code. The first challenge was lazy loading (pagination onScroll) for Reddit comments in long threads. I had idea maybe to force Reddit to load all comments and then process them but thought Reddit did it for a reason and it will hurt performance and produce unusable load lags so I chose to do all comments processing on onUrlChange and onScroll events. This was major decision that shaped the rest of the extension. I debounced these events with custom time amounts that I determined trough trial and error practical tests what works best. All constants are set in a single place and easy to review and manage.

Initially I thought Reddit also does windowing of comments (removing from DOM non visible comments) and thought I will have to deal with it too, but later I concluded it's not the case, only lazy load with pagination onScroll.

Another important thing is routing in Reddit single page application. If you look carefully when you open a thread from subreddit page it will just change url but DOM will be mostly the same and thread will loading overlay modal. I had to detect and handle this properly to be able to select elements correctly. 

Also it affects attaching/detaching onScroll handlers because it's a client side routing with existing DOM without real onLoad event, it took me some time to deal with this. Still this isn't solved perfectly and there is one open issue related to onScroll event firing before onUrlChange and has insufficient timeout for content to load completely which sometimes causes exception that I handled, but still think maybe there is a better way to sync those events and prevent exception at all. I documented it in this issue, if you are experienced JavaScript developer and have ideas about this I would appreciate advices and suggestions how to solve this better.

[onScroll event fires before onUrlChange #1](https://github.com/nemanjam/reddit-unread-comments/issues/1)

Threads that are accessed by opening in a new tab or with direct navigation are not opened in a modal but as a page so I had to detect and handle this case too.


## 3. IndexedDB and database schema

Visited threads, read comments and user settings are stored locally in IndexedDB. Bellow is database schema. Thread and comment form a `1:N` relation. Each comment stores a session in which it's been read, in the `sessionCreatedAt` column. Only two sessions are differentiated, 1. The current session with reserved timestamp `2e2` and 2. All previous sessions with timestamp of the latest comment from that session. This is enough to be possible to mark a comment as read onScroll in current session but to keep it highlighted onHover. This way state is always kept in the database and never in the DOM, and DOM classes can be recreated at any time.

#### Database schema

![Database schema](/docs/screenshots/database-schema.png)

```sql
-- implemented in IndexedDB
-- https://dbdiagram.io syntax

Table Thread {
  id integer [primary key, note: 'autoincrement']
  threadId varchar [unique]
  updatedAt timestamp
  latestCommentId varchar
  latestCommentTimestamp timestamp
}

Table Comment {
  id integer [primary key, note: 'autoincrement']
  commentId varchar [unique]
  threadId varchar
  sessionCreatedAt timestamp [note: '2e2 | now()']
}

Table Settings {
  id integer [primary key, default: 1, note: 'singleton']
  isHighlightOnTime boolean
  timeSlider varchar
  timeScale varchar
  isHighlightUnread boolean
  unHighlightOn varchar
  scrollTo varchar
  sortAllByNew boolean
  enableLogger boolean
}

Ref: Thread.threadId < Comment.threadId -- Thread:Comment 1:N
```

To avoid using background script for converting comments from current session into previous session I handle pending comments from previous session at the beginning of new session. When user arrives to new thread pending comments from current session of the previous thread are handled. This is done in `updateCommentsFromPreviousSessionOrCreateThread()` function in `dom.ts` file where all comments with `Comment.sessionCreatedAt = 2e2` are reassigned to `Comment.sessionCreatedAt = Thread.updatedAt`. Based on `Comment.sessionCreatedAt` values CSS classes `.ruc-highlight-comment` and `.ruc-highlight-comment-read` are added and removed to the DOM.

Thread table also stores `latestCommentId` and `latestCommentTimestamp` columns which seemed to be useful but currently they are unused, just calculated and stored.

Native JavaScript API for working with IndexedDB is pretty verbose, based on callback, without promises support, inconvenient to extract a single global connection instance. All of this would be easier to handle using a wrapper like [dexie/Dexie.js](https://github.com/dexie/Dexie.js) or [jakearchibald/idb](https://github.com/jakearchibald/idb) and this is one of the future tasks, to rewrite all database functions.

## 4. Highlight, highlight-read classes and sessions

For unread comments there are two CSS classes, `.ruc-highlight-comment` for still unread comments and `.ruc-highlight-comment-read` for read comments in current session, this class has background highlight onHover which can be useful to remind and still identify about new comments. Important note here is that all state about comments is always kept in database and never in the DOM, and DOM with classes can always be recreated. This is achieved with sessions implemented in the database, where only current and all previous sessions are differentiated. Highlight transition is applied only onHover out, which is an additional trick.

There is an additional `.ruc-highlight-comment-by-date` class to highlight yellow comment timestamps by time.

## 5. Tailwind disable preflight styles

Reddit has its own baseline styles which are affected if I inject regular Tailwind, I solved this by disabling Tailwind preflight in the config which fixed everything and left original Reddit styling intact. I only load few classes for highlighting comments and RadixUI Themes components that I used to build User Settings popup form.


## 6. Limit IndexedDB database size

Browser limitation for IndexedDB is around 50 MB. To avoid accumulation of old threads and uncontrolled growth of database size there is a logic that on every new thread addition checks if `currentDatabaseSize > 1 MB` and if yes starts deleting the oldest threads until database size isn't reduced bellow 0.5 MB. These values are defined in `constants.ts` in `dbSizeLimit` and `dbTargetSize` variables. This way the user never has to worry about cluttered browser storage and t delete things manually.

## 7. All Reddit DOM selectors, time waits constants are extracted into single file

It is likely that Reddit website design, DOM, configurations will change in future. I thought about this from the beginning and made sure extension maintenance and debugging is as painless as possible by extracting all of them into a single `constants.ts` file where all can be reviewed and tweaked in a single place. Also along with all other constants like debounce timeouts, CSS classes, regular expressions, database size limits. The last thing I want is that in 3 months I have to chase scattered selectors through the code to fix the extension to handle updated Reddit's UI.

## 8. Same-origin policy for the content script code and Popup code

This was one of the most interesting challenges. Important thing I realized is that code in the content script and popup script don't aren't executed in the same context, they act as separate tabs under separate domains. If you print `window.location.href` in the popup script you will get url something like `moz-extension://some-guid/popup.html`. This practically means they can't use the same IndexedDB database because it respects Same-origin policy tied to a domain. For that there is a event messaging interface which you can use to implement your own messaging protocol for communicating between popup script and content script. IndexedDB will be defined in content script code and popup will send message when it requires or sends data. Usually this is done in this order `popup script` -> `background script` -> `content script` but I wanted to keep complexity at minimum and until that point didn't have real need for background script and I found out popup can send data directly to content script so I chose that path. I also wanted to avoid code that runs permanently in the background unless it's really necessary.

I used two browser API's: `browser.tabs.sendMessage(tabId, message)` for sending messages and  `browser.runtime.onMessage.addListener(handler)` for receiving messages and returning an optional answer, so the communication can flow in both directions. Code for this is in `message.ts` and `events.ts` files and implementation reminds of Redux with actions with type and payload and switch/case statement in the handler function for the handling part. I used this channel to exchange data from database and DOM between content script and popup form which is React component.

Additional point, for debugging popup code I had to use browser console, opened with `Ctrl + Shift + j` and `console.error` instead of `console.log`.

## 9. Build User Settings Popup with RadixUI Themes form controls and react-hook-form

I am a React developer so it's logical that I use React to build UI. I chose RadixUI for form controls since it looks like most mature component library at this moment. I always prefer react-hook-form for forms so I used its Controller component to integrate it with RadixUI controls. This works well and it's expected, it's not some complex UI. At some point I realized that since there is no validation there is no real need for a form library, I could just use simplified state management solution with `useReducer` and `onChange` handlers but I didn't think it's worth rewriting the existing solution with react-hook-form, both are fine solutions.

## 10. Sort all threads `By New` by default

It's the one feature that I missed myself and wanted to have it. In the existing Reddit Account settings you can enable default sort but it's only for the threads within subreddit page, you can't configure default sort of the comments within the threads. Most of the subreddits have this default set to `By Best` which I personally don't prefer, to me it seems like "helping the user too much" and wanted to be able to see comments in a chronological order which makes most sense to me and spends me least effort to follow the context of the conversation.

Initially I thought to implement this by rewriting the url in which threads are opened by appending `?sort=new` query param. Quickly I discovered that it's not so good idea, it can easily cause recursion and instability in `onUrlChange` event that is implemented using IntersectionObserver. Also it's pretty obtrusive to default Reddit behavior, I am not sure those threads will open in a overlay modal as usual. So I left that idea and went for automating a regular `click` event on the select control in the UI. The downside is that it increases load time for the comments because they need to load twice. It was an tradeoff that I made and I seems good enough for me. Mitigating circumstance is that threads that are already sorted `By New` by default are completely unaffected by this code.

## 11. Calculate the latest comment with function closure to avoid nested loops

ChatGPT showed me a nice and elegant trick how to use function closure to keep state which I can further use to reuse the existing `commentElements.forEach()` loop and keep track of the latest comment in same go. This way I could save performance and avoid calculating the same with two nested loops. You can see code example in the `createLatestCommentUpdater()` function in the `dom.ts` file.

## 12. Update DOM through `document.querySelectorAll()` without a frontend framework

Like many other developers I spent last few years manipulating DOM through React and for a moment forgot the feeling how it's to work with native JavaScript API's. When you select a list of comment elements `const commentElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(commentSelector)` TypeScript tells you that you don't have a `filter` method to select a subset of elements but only `forEach`, this is for a reason. Then you try to pass `NodeListOf` to the `Array.from()` and filter array and when you try update some element you see that it's not reflected in the DOM, which makes sense because you don't have a declarative framework here. So the solution is to precalculate result in the array, then loop through the original `NodeListOf` and skip the elements you don't need with `array.includes()` for example, like in the `highlightByDate()` function in `dom.ts`. This way you get live updates in the DOM.

## 13. Scroll to the next page of highlighted comments

There is a implementation to scroll to the next page of highlighted comments with `Ctrl + Space` and to scroll to reset scroll to the first page with `Ctrl + Shift + Space`. There are two challenges related to this: 1. Scroll can be on the page (`document` element) and on the modal element, they separate calculations, 2. It should scroll to the next page of the comments (first comment that is currently not visible) and not just to the next comment, much better user experience.

The calculation for scrolling to pages is in `scrollNextCommentIntoView()` in `dom.ts`. It has logic to detect the first comment outside of the current viewport, detect and handle both `document` and modal as scroll elements (modal scroll takes header hight into account) and to reset scroll to the first page. State for `currentIndex` of the scrolled comments is stored in a closure.

Additionally there is a filtering logic to scroll to unread highlighted comments, highlighted comments by timestamp or both.

Inspiration for the scroll feature and `Ctrl + Space` shortcut is taken from this project [slikts/unreaddit](https://github.com/slikts/unreaddit).

## 14. Manifests v2 and v3, Firefox and Chrome

There is a slight mess with standardization, you can't use a single manifest to build for both, Chrome requires manifest `v3` and Firefox is fine with `v2`, so I put both in the git so you can just copy the right one into `manifest.json` file before building the extension for publishing on store. There are more differences to get extension reviewed and approved, for example I had to remove `storage` permission for Chrome, it's not needed for IndexedDB which seemed logical initially.

## 15. v0.0.2 and rerun content script on tab focus

The extension gets loaded only under `reddit.com` domain which is defined in the `manifest.json`. Event handlers are attached only in the active tab sou you don't have unnecessarily running code in inactive opened Reddit tabs. Also Popup is loaded only in Reddit threads because form controls only make sense there. After I made the initial release I noticed one bug where Popup can't be loaded in threads that are opened in new tab, this happened because it's not active tab too and doesn't pass condition in Popup's `useEffect`. I solved this by rerunning everything on `visibilitychange` event, I could do this because entry point function already has all other checks.









