
#### Node v20

```bash
# add env var
NODE_OPTIONS=--openssl-legacy-provider
```
extenzija se glavi, console.log('bilo sta'); inace remove i load manifest
page refresh ne reloaduje content-script main, templejt mozda nije dobar
-----
reddit rutira client-side bez da je browser svestan zato mora u manifest i
"http://*.reddit.com/*",
"https://*.reddit.com/*"
a ne samo
"http://*.reddit.com/*/comments/*",
"https://*.reddit.com/*/comments/*"
* radi i kao ** za /a/b/c/
----
Solution: must run in entire reddit "http://*.reddit.com/*", just prevent attaching listeners in non-thread pages
// must be extracted function
export const isRedditThread = () => redditThreadRegex.test(location.href);
--------
domready ne postoji zbog client side routing
-------------
// scroll attach detach, modal, ne html
drugi element ima scroll, neki div kao modal, ne html
nije ista sranica na direktan thread link i redirect from subreddit
zapazi da je modal zapravo, <div id="overlayScrollContainer"
https://stackoverflow.com/questions/34532331/finding-all-elements-with-a-scroll
-------------
timestamp neprecizan 2 months ago
--------------
resenje za tailwind border, falilo border-style: solid // eto
@apply border border-solid border-red-300;
---------
// indexDb
create me following schema for indexdb:

thread table has following columns:
id // number autoincrement
threadId // string, primary key
updatedAt // datetime
latestPostId // string
latestPostTimestamp // datetime

post table has following columns:
id // number, autoincrement
postId // string, unique, Post.postId and Post.threadId compose primary key
threadId // references Thread.threadId

----------
load settings in popup exception
```ts
// this fails
getRequest.onsuccess = () => {
    resolve(getRequest.result as SettingsData);
};

// this works, actually this fails too, works only for getAll()
//! MUST use event and not getRequest
getRequest.onsuccess = (event) => {
    const result = (event.target as IDBRequest).result as SettingsData;
    resolve(result);
};
```
get(id) fails always, use index(objectStore).get(id) even for id 
zapravo sve gore je netacno, glavno je da nisam insert SettingsData row na db create
solution:
run settingsObjectStore.add(defaultDbValues); in schema.onupgradeneeded, runs only on schema change
------------
after publish:
event, detect when tab becomes active and let it run

```ts
document.addEventListener('visibilitychange', attachAllEventHandlers); // just rerun

export const isActiveTab = () => document.visibilityState === 'visible';
```
