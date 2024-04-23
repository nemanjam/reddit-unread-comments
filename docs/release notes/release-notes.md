#### 1.0.0

1. Support new Reddit design (www.reddit.com)
2. Add Immediately checkbox to mark thread as read manually
3. Update Readme.md and add new screenshot
4. Update Chrome manifest v3

Screenshot of User Settings popup and highlighted unread comments and highlighted comments by time.

#### 1.1.0

1. Break the existing dom, events, constants logic into separate files
2. Completely rewrite events logic
    - attach `onScroll`, `onKeyDown`, `onVisibilityChange` unconditionally on mount
    - fix `onUrlChange` mutation observer event and debounce it, await `location.href`, fixed `hasLeftThread` condition
    - add custom `onArrivedToRedditThread` event
    - replace the existing debounce function with `debounceLeading` and `debounceTrailing` from lodash
3. Add `retryAndWait` function for better awaitng thread loading state

