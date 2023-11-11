
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

