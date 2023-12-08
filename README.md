# Reddit Unread Comments

Did you ever had to reread entire 200+ comments Reddit thread just to find a few new comments? Every day, few times a day?

Chrome/Firefox extension for easier tracking of new comments on Reddit. Free, open source, privacy aware, runs completely client side without sending any data to any server.

## Screenshots

![Screenshot_1](/docs/screenshots/Screenshot_1.png)

## Demo

## Features

- Two separate highlighting modes: 1. Highlight unread comments, 2. Highlight based on comment's timestamp.
- Unread comments can be un-highlighted: 1. after 5 seconds after appearing in viewport, while still being highlighted on mouse hover, 2. after navigating away from thread (url change).
- Comments are highlighted on both page load (url change) and on scroll.
- Count of highlighted comments for both kind, in realtime.
- All form controls in Popup are imidiately reflected and realtime.
- Scroll to the next highlighted comment with `Ctrl + Space`. Scroll to the first highlighted comment with `Ctrl + Shift + Space`. Can pick weather to scroll to 1. Unread highlighted comment, 2. Highlighted comment by timestamp, or 3. Both.
- Sort all Reddit threads by new by default (will introduce additional 3-5 seconds delay for comments to load twice).
- Enable/disable logging to browser console. Useful for debugging when reporting bugs.
- Reset highlighted comments for; 1. A thread, 2. All threads, 3. Reset user settings (Popup controls) to default.
- IndexDb size is checked on every new thread and limited to 1MB when it will be reduced to 0.5MB by deleting the oldest threads from the database. Browser limit for IndexDb is around 50MB.
- Extension is minimally obtrusive to the existing Reddit behavior, lazy loading (pagination) of threads is intact, as well as loading threads as new page and within modal. Tailwind preflight styles are disabled, only highlight classes are included so the original Reddit styling is intact.
- All Reddit selectors are extracted into a single file `source/reddit-comments/constants.ts` making it easier to update and maintain when Reddit modifies design and markup in the future.
- Extension runs completely client side, no data ever leaves users browser.
- Extension is loaded only on Reddit domain. Popup is loaded only on Reddit threads. All data is kept within a single IndexDb.

## Installation

## Usage

## Development

- For the recent Node.js versions (v20+) you will need `NODE_OPTIONS=--openssl-legacy-provider` option which is already included in the `package.json` scripts.Install dependencies:

```bash
yarn install
```

For Firefox and Chrome you need to run the following scripts respectively:

```bash
# Firefox
yarn dev:firefox

# Chrome
yarn dev:chrome
```

- To load the extension in Firefox navigate to `about:debugging#/runtime/this-firefox` and load the manifest file from `extension/firefox/manifest.json`. Popup will load only in Reddit threads. See the screenshot bellow:

![Screenshot_2](/docs/screenshots/Screenshot_2.png)

- When debugging the Popup code in Firefox you will need to open developer console with ` Ctrl + Shift + j` and to use `console.error` instead of `console.log`. There is a logger instance in `source/reddit-comments/logger.ts` that you can use for logging and debugging in code other than Popup.

## Contributing

- Before any work please open an issue in this repo to discuss with me about a feature you want to add. Some of the possible future tasks are:

- Use IndexDB wrapper library to reduce complexity and verbosity of the existing database code: [https://github.com/dexie/Dexie.js](https://github.com/dexie/Dexie.js) or [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb).
- The initial extension starter project [abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter) is outdated and requires updating.
- Use `useReducer` with `onChange` to handle Popup form fields instead of the existing `react-hook-form` **(maybe)**. Because it's just state management without any validation logic.
- `isElementInViewport()` can be improved for the comments higher than viewport (maybe).
- Add live new comment notifications with backgroundScript **(maybe)**.
- Improve exception classes in `source/reddit-comments/exceptions.ts`.
- Make `redditThreadUrlRegex` in `source/reddit-comments/constants.ts` mor tight (maybe).

## References

- Starter template project [abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter)
- Similar outdated extension, idea for IndexDB and `Ctrl + Space` scroll [slikts/unreaddit](https://github.com/slikts/unreaddit)

## Author

[https://github.com/nemanjam](https://github.com/nemanjam)

[https://www.linkedin.com/in/nemanja-mitic](https://www.linkedin.com/in/nemanja-mitic)

December 2023.

## License

This project uses MIT license: [License](LICENSE)
