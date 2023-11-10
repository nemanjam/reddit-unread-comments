
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


