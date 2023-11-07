
const isDebug = process.env.IS_DEBUG ===  'true' || true;

const currentHostname = window.location.hostname;
const isReddit = currentHostname === 'www.reddit.com';

const timestampSelector = '[data-testid="comment_timestamp"]';
const timestampElements = document.querySelectorAll(timestampSelector);



const debug = () => { 
    console.log('run reddit logic')
    console.log(`Current hostname: ${currentHostname}, isRedit: ${isReddit}`);
    console.log(`timestampElements.length: ${timestampElements.length}`);

}

const main = () => { 
    if (isDebug) debug();

    if (!isReddit) return;


 }


export default main;
