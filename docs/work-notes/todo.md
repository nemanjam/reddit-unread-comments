on url change
fix typescript config
detect how many comments to tune delay
next prev buttons
vertical nav, like vs code
disable windowing, ask react reddit
run only in active tab
lodash debounce
hashmapa url: time latest comment, for unread
inject only in reddit, both js, css
sort by new always // to
------
interface:
redirect/sort by new
mark last hour, week, slider 
call content scripts from interface popup
// ReactComponent.js
// Send a message to the content script
browser.runtime.sendMessage({
    messageFromReact: message,
});
// contentScript.js

// Listen for messages from the extension
browser.runtime.onMessage.addListener((message) => {
  if (message.messageFromReact) {
    // Do something with the message received from the React component
    console.log('Received message from React:', message.messageFromReact);
    
    // Call your function and pass the message
    myFunction(message.messageFromReact);
  }
});
-------
replace return null with try catch and exceptions
validate function input arguments
---------
add sessions for scroll
filter un-highlight only from last session, detect, na url change, in memory copy cache
-------
create custom exception classes // to
db function to update comment.sessionCreatedAt to thread.updatedAt

--------------

// unhilight in real time...
// za realtime ovde treba addOrUpdate // ETO, db baca exception
const commentData = await addComment(db, {
  threadId,
  commentId,
  sessionCreatedAt: thread.updatedAt,
});
-----
database, reset, readAll, exceptioni logovanje, jer devtools outdated data
----------
zadrzi highlight na hover mode // to

---------------
// ui:
time range control i highlight
    unhighlight mode: scroll, url-change
    clear database, clear thread
github url
sort by new by default, url change teze, global default sort by any
checkboxes: scroll to unread, scroll to by date, scroll to both
// tailwind component library
https://www.reddit.com/r/reactjs/comments/17vd9v5/what_component_library_do_you_use_with_tailwindcss/?sort=new
HeadlessUI and RadixUI
use this https://www.radix-ui.com/themes/playground
create logo icon // this
react hook form
https://www.radix-ui.com/primitives/docs/components/form
move contentScript to radix theme maybe
save popup state in indexdb database
---------------
    highlight by date
    database size limit   
log level debug, lib neki
chrome
popup number of new comments
    ctrl space scroll to next comment
----------
set my name in package.json and manifest.json
write readme, make video, publish to ffox store
----------
// future:
realtime popup notifications, background script
----------
    print slider value, print scale
click set sort by new and delay
    prepopulate form from db settings
    db settings schema
    debounce slider onChange
    send messages from popup to contentScript
limit db size is not tested
    db operacije sa settings tabelom pucaju - limit-size Promise.all([...]) and settingsObjectStore.get(settingsId) in getSettings
    loader skeleton for popup
    remove reddit toast
-------------
fix limitIndexedDBSize(), test it
    remove reset radios from db
    reset current thread and all threads
    implement radioAndSliderToDate()
----
    get all db data for debug
----
not same db in popup and contentScript? manifest?
-----
    scroll to first comment thats not in viewport
    reset all highlight on settings change (css dom and event listeners)
    fix reset slider on radio and switch
---------
    threadId puca zbog modal, dodatni delay zbog new dok ucita comments, debouncedUrlChangeHandler, no order of waiting and selecting
    logging switch
    add additional debugging logging
    fix link flex grow, disable align stretch
    add unread switch
    test db size deleting
    check console errors
    check if reddit thread url in popup
    display comments count
    trigger on interval and onChange
-----------------
after publish:

github action for tag and release
don't forget: update readme with links BEFORE the release

// done v0.0.4
remove focus from new select box, click somewhere else
logger switch isn't realtime, Logger.resetInstance()

