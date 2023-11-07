// import './styles.scss';

const isDebug = process.env.IS_DEBUG ===  'true' || true;

const currentHostname = window.location.hostname;
const isReddit = currentHostname === 'www.reddit.com';

// on url change
// fix typescript config
// detect how many comments to tune delay
// next prev buttons
// vertical nav, like vs code
// disable windowing, ask react reddit
// run only in active tab


const currentUrl = window.location.href;
const redditThreadRegex = /https?:\/\/(www\.)?reddit\.com\/r\/(\w+)\/comments\/([^/]+)/;
const isRedditThread = currentUrl.match(redditThreadRegex) !== null;


const highlight = () => { 

const timestampSelector = '[data-testid="comment_timestamp"]';
// const timestampSelector = 'div';

    
    const timestampElements = document.querySelectorAll(timestampSelector);
    timestampElements.forEach(element  => {
        const htmlElement = element as HTMLElement;
        // element.classList.add('ruc-highlight-comment');
        htmlElement.style.border = '2px solid blue';
    });
    console.log(`timestampElements.length: ${timestampElements.length}`);
    console.log(`Current url: ${currentUrl}, isRedditThread: ${isRedditThread}`);
    console.log('Highlighted.');


}

const debug = () => { 
    console.log('run reddit logic')
    console.log(`Current hostname: ${currentHostname}, isReddit: ${isReddit}`);
    // console.log(`timestampElements.length: ${timestampElements.length}`);

}


const main = () => { 
    if (isDebug) debug();

    if (!isRedditThread) return;

    // Attach the debounced scroll handler to the window's scroll event
    window.addEventListener('scroll', debouncedScrollHandler);

 }


export default main;

// Function to be executed when the user stops scrolling
function handleScroll() {
    // Your code to run when scrolling has stopped
    highlight();
  }
  
  // Debounce function
  function debounce(func: Function, wait: number) {
    let timeout: any;
    
    return function(this: Window) {
      const args = arguments;
  
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  }
  
  // Set the wait time in milliseconds (e.g., 300 milliseconds)
  const debounceWait = 1000;
  
  // Create a debounced scroll handler
  const debouncedScrollHandler = debounce(handleScroll, debounceWait);
  
 
  


