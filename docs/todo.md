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
sort by new always
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


