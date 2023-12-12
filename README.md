# Reddit Unread Comments

Have you ever had to reread entire 200+ comments Reddit thread just to find a few new comments? Every day, few times a day?

Chrome/Firefox extension for easier tracking of new comments on Reddit. Free, open source, privacy aware, runs completely client side without sending any data to any server.

## Screenshots

![Screenshot_1](/docs/screenshots/Screenshot_1.png)

## Demo

## Features

- Two separate highlighting modes: 1. Highlight unread comments (red), 2. Highlight based on comment's timestamp (yellow).
- Unread comments can be un-highlighted: 1. 5 seconds after appearing in viewport, while still being highlighted on mouse hover, 2. After navigating away from thread (url change).
- Comments are highlighted on both page load (url change) and on scroll.
- Unread comments are separated in the database into two sessions: 1. Current session (thread visit), 2. All earlier sessions. This way un-highlighting can be managed more precisely and state is never kept inside the DOM.
- Count of highlighted comments for both kind, in realtime.
- All form controls in Popup are imidiately reflected and realtime.
- Scroll to the next page of currently not visible highlighted comments with `Ctrl + Space`. Scroll to the first highlighted comment with `Ctrl + Shift + Space`. Can pick weather to scroll to 1. Unread highlighted comment, 2. Highlighted comment by timestamp, or 3. Both. Scrolling to the next page of not visible comments is more efficient compared to just scrolling to the next comment.
- Sort all Reddit threads by new by default (will introduce additional 3-5 seconds delay for comments to load twice).
- Enable/disable logging to browser console. Useful for debugging when reporting bugs.
- Reset highlighted comments for; 1. A thread, 2. All threads, 3. Reset user settings (Popup controls) to default.
- IndexDb size is checked on every new thread and limited to 1 MB when it will be reduced to 0.5 MB by deleting the oldest threads from the database. Browser limit for IndexDb is around 50 MB.
- Extension is minimally obtrusive to the existing Reddit behavior, lazy loading (pagination) of threads is intact, as well as loading threads as new page and within modal. Tailwind preflight styles are disabled, only highlight classes are included so the original Reddit styling is intact.
- All Reddit selectors are extracted into a single file `source/reddit-comments/constants.ts` making it easier to update and maintain when Reddit modifies design and markup in the future.
- Extension runs completely client side, no data ever leaves users browser.
- Extension is loaded only on Reddit domain. Popup is loaded only on Reddit threads. All data is kept within a single IndexDb.
- This extension won't be aware if you visited Reddit threads on a phone app or in other browsers, it runs completely locally.

## Installation

### Install from store

- **Firefox store link:** [https://addons.mozilla.org/en-US/firefox/addon/reddit-unread-comments](https://addons.mozilla.org/en-US/firefox/addon/reddit-unread-comments/)

- **Chrome store link:** [https://chromewebstore.google.com/detail/bbpcddepjkegcdfnddhagpdjhmhnegcc](https://chromewebstore.google.com/detail/bbpcddepjkegcdfnddhagpdjhmhnegcc/)

### Install manually

Go to release page [https://github.com/nemanjam/reddit-unread-comments/releases/tag/v0.0.2](https://github.com/nemanjam/reddit-unread-comments/releases/tag/v0.0.2) and download Firefox `.xpi` or Chrome `.zip`.

- **Firefox manual install:**

  - In Firefox click `Settings` (three horizontal lines in the top-right corner), click `Extensions tab`, click `Gear` icon right from `Manage Your Extensions`, choose `Install Add-on From File...` from the menu and browse `reddit-unread-comments-v0.0.2-firefox.xpi` file which you can download from the release page.

  - **Firefox `.xpi`:** [reddit-unread-comments-v0.0.2-firefox.xpi](https://github.com/nemanjam/reddit-unread-comments/releases/download/v0.0.2/reddit-unread-comments-v0.0.2-firefox.xpi)

- **Chrome manual install:**

  - In Chrome navigate to `chrome://extensions/`, switch `Enable developer mode` to true, click `Load unpacked` and browse `reddit-unread-comments-v0.0.2-chrome.zip` file which you can download from the release page.

  - **Chrome `.zip`:** [reddit-unread-comments-v0.0.2-chrome.zip](https://github.com/nemanjam/reddit-unread-comments/releases/download/v0.0.2/reddit-unread-comments-v0.0.2-chrome.zip)

## Usage

**Note:** To use this extension **you must be logged in into your Reddit account** when visiting pages because Reddit has different HTML for signed in and not signed in users.

#### The Problem

Reddit uses `Best` (mostly), `Top`, `New`, `Controversial`, `Old` and `Q&A` for primary sorting orders for comments in threads. Secondary sorting order (comments of a comment) are always chronological - `New`.

So what is wrong with this and why this needs fixing?

Sorting by `Best` (default in most subreddits) breaks chronological order of the comments and you can't always understand context if some comment is a reaction to some previous comment and also makes it impossible to track what are the new comments since your last visit. Because you usually check same thread few times if that is topic of your interest. This gets worse if thread has hundreds of comments when you have to reread entire thread just to spot few new comments which is waste of time and nerves. All of this is probably something that you are already familiar with.

#### The Solution

Just simplify things, make them intuitive and sort everything chronologically by new, mark unread comments since last visit with red highlight for threads that I closely follow and read multiple times, and add independent secondary yellow highlight based on comment's timestamp where I can quickly filter new comments for threads that I visit for the first time or follow less closely. When you move the slider highlight and Count are reflected imidiately. Use `Ctrl + Space` and `Ctrl + Shift + Space` shortcuts to scroll quickly to the next unread page (or new) of comments and to the first unread comment respectively. Optionally force default sorting to `New` for all subreddits. Use reset thread and reset threads options if you want to start from scratch. That's it.

## Development

- For the recent Node.js versions (v20+) you will need `NODE_OPTIONS=--openssl-legacy-provider` option which is already included in the `package.json` scripts. Install dependencies with:

```bash
yarn install
```

- For Firefox and Chrome you need to run the following scripts respectively:

```bash
# Firefox
yarn dev:firefox

# Chrome
yarn dev:chrome
```

- To load the extension in Firefox navigate to `about:debugging#/runtime/this-firefox` and load the manifest file from `extension/firefox/manifest.json`. Popup will load only in Reddit threads. See the screenshot bellow:

![Screenshot_2](/docs/screenshots/Screenshot_2.png)

- To load the extension in Chrome navigate to `chrome://extensions/`, enable `Developer mode` switch and select the entire Chrome extension folder `extension/chrome`.

![Screenshot_3](/docs/screenshots/Screenshot_3.png)

- When debugging the Popup code in Firefox you will need to open developer console with ` Ctrl + Shift + j` and to use `console.error` instead of `console.log`. There is a logger instance in `source/reddit-comments/logger.ts` that you can use for logging and debugging in code other than Popup.

- To view logs in Chrome you need to enable developer mode and click `background page` link for this extension, see this [Stackoverflow answer](https://stackoverflow.com/questions/10257301/accessing-console-and-devtools-of-extensions-background-js/10258029#10258029)

### Building for production

To build binaries run the following commands:

```bash
# Firefox - outputs: extensions/firefox.xpi
yarn build:firefox

# Chrome - outputs: extensions/chrome.zip
yarn build:chrome

```

#### Important:

When building the extension for publishing to stores for Chrome you must use `v3` manifest from `source/manifest-v3-chrome.json` and for Firefox `v2` manifest from `source/manifest-v2-firefox.json`. Just copy the content from the file you need into `source/manifest.json` and build the archive you need.

## Contributing

Before any work please open an issue in this repo to discuss with me about a feature you want to add. Some of the possible future tasks are:

- `onScroll` in thread overlay fires before `onUrlChange` with less delay for DOM to load, causing overlay not to be detected and comment `timestampId` not to be found, exception is handled but still try to fix. The issue is documented here: [onScroll event fires before onUrlChange #1](https://github.com/nemanjam/reddit-unread-comments/issues/1)
- Use IndexDB wrapper library to reduce complexity and verbosity of the existing database code: [https://github.com/dexie/Dexie.js](https://github.com/dexie/Dexie.js) or [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb).
- The initial extension starter project [abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter) is outdated and requires updating.
- Cleanup remaining exceptions from console (if any).
- Use `useReducer` with `onChange` to handle Popup form fields instead of the existing `react-hook-form` **(maybe)**. Because it's just state management without any validation logic.
- `isElementInViewport()` can be improved for the comments higher than viewport (maybe).
- Add live new comment notifications with backgroundScript **(maybe)**.
- Improve exception classes in `source/reddit-comments/exceptions.ts`.
- Make `redditThreadUrlRegex` in `source/reddit-comments/constants.ts` more tight (maybe).
- Add tests (maybe).
- Create more original logo icon (maybe).

## References

- Starter template project [abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter)
- Similar outdated extension, idea for IndexDB and `Ctrl + Space` scroll [slikts/unreaddit](https://github.com/slikts/unreaddit)

## Author

[https://github.com/nemanjam](https://github.com/nemanjam)

[https://www.linkedin.com/in/nemanja-mitic](https://www.linkedin.com/in/nemanja-mitic)

December 2023.

## License

This project uses MIT license: [License](LICENSE)
