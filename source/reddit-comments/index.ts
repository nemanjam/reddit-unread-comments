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
// lodash debounce
// hashmapa url: time latest comment, for unread

const redditThreadRegex = /https?:\/\/(www\.)?reddit\.com\/r\/(\w+)\/comments\/([^/]+)/;
const timestampSelector = '[data-testid="comment_timestamp"]';

let currentUrl = window.location.href;
let isRedditThread = false;


const highlight = () => { 

    if (!isRedditThread) return;
    
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

  observer.observe(document, {subtree: true, childList: true});
  window.addEventListener('beforeunload', () => observer.disconnect());

 }


export default main;

const handleScroll = () =>  highlight();

let previousUrl = '';
const observer = new MutationObserver(() => {
  if (location.href !== previousUrl) {
      previousUrl = location.href;
      // alert(location.href)
      debouncedLocationChangeHandler()
    }
});


const handleLocationChange = () => {

  currentUrl = window.location.href;
  isRedditThread = currentUrl.match(redditThreadRegex) !== null;


  if(isRedditThread) {
    window.addEventListener('scroll', debouncedScrollHandler);
    alert('attached')
    highlight();
  }
  else {
    window.removeEventListener('scroll', debouncedScrollHandler);
    alert('DEttached')
  }

}
  
  // Debounce function
  function debounce(func: Function, wait: number) {
    let timeout: any;
    
    return function() {
      const args = arguments;
  
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(window, args);
      }, wait);
    };
  }
  
  const debounceWait = 1000;
  
  const debouncedScrollHandler = debounce(handleScroll, debounceWait);
  const debouncedLocationChangeHandler = debounce(handleLocationChange, debounceWait);
  
 
  


