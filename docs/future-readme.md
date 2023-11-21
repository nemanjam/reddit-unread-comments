
#### Interesting challenges

- windowing on reddit and scroll handler
- debounce, wait for dom load, client router
- reddit thread with scroll on modal and on page
- tailwind border-style: solid
- isElementInViewport sync and async intersectionObserver, async fns bubbling
- document.querySelectorAll<HTMLElement>(commentSelector) not live updating, forEach, filter

- async open database | null, db handlers in global scope

- get latest comment with function closure to avoid nested loops

- must have session for scroll highlight so it doesn't mark read immediately
- store session timestamp in each comment

- avoid background script by handling pending last run
- cant use custom events from url change arrivedTo and leftFrom redditThread because order for async handlers cant be guaranteed

- control contentScript from React popup component

- error handling - try/catch, what can break, no return null, undefined, no optional args, custom exceptions
- framework vs custom project, architecture decisions

- transition on remove class only, you need to redefine transition prop too
https://stackoverflow.com/questions/9509002/css-transition-when-class-removed

- keep all state (read comments) in database, no state in dom, windowing, unmount redirect
- promisify moze da konvertuje indexdb callbacks u async await promises

- modify url ?sort=new query param without triggering new change or extension manifest
- scroll element to top in modal and in window calculation

- fix peer dependency with yarn why postcss and optimize-css-assets-webpack-plugin
