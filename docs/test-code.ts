
async function scrollToEnd() {
    const scrollDelay = 3000; // Adjust as needed
    const maxScrollRetries = 10; // Adjust as needed
    let previousScrollHeight = 0;
    let scrollRetries = 0;
  
    const scrollToBottom = () => {
      return new Promise(resolve => {
        window.scrollTo(0, document.body.scrollHeight);
        setTimeout(() => resolve(undefined), scrollDelay); // Provide an argument to resolve
      });
    };
  
    const checkForContentChange = async () => {
      const currentScrollHeight = document.body.scrollHeight;
  
      if (currentScrollHeight !== previousScrollHeight) {
        // Content has changed; stop scrolling
        previousScrollHeight = currentScrollHeight;
        scrollRetries = 0;
        await scrollToBottom();
      } else if (scrollRetries < maxScrollRetries) {
        // Content has not changed; retry scrolling
        scrollRetries++;
        console.log('Scrolling...');

        await scrollToBottom();
      } else {
        // Reached the maximum number of retries; stop scrolling
        console.log('Reached the end of content or maximum retries.');
      }
    }
  
    // Start the scrolling process
    await scrollToBottom();
    await checkForContentChange();
  }
  
  // t1_k8etzzz from CommentTopMeta--Created--t1_k8etzzzinOverlay
// t1_k8etzzz from CommentTopMeta--Created--t1_k8etzzz // actually this
export const getCommentIdFromTimestampId = (timestampId: string) => {
  const match = timestampId.match(captureCommentIdFromTimestampIdRegex);

  if (match) {
    const extractedString = match[1];
    return extractedString;
  }

  return null;
};

export const getCommentElementFromTimestampElement = (timestampElement: HTMLElement) => {
  const commentId = getCommentIdFromTimestampId(timestampElement.id);
  const commentElement = document.querySelector<HTMLElement>(`#${commentId}`);
  return commentElement;
};

export const findClosestParent = (
  startingElement: Node,
  selector: string
): Node | null => {
  let currentElement: Node | null = startingElement;

  while (currentElement && currentElement !== document) {
    currentElement = currentElement.parentNode;

    if (!(currentElement instanceof Element)) {
      continue;
    }

    if (currentElement.matches(selector)) {
      return currentElement;
    }
  }

  return null;
};


export const isElementInViewport = (
  element: HTMLElement,
  callback: (isVisible: boolean) => void
): void => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(true);
        observer.disconnect();
      } else {
        callback(false);
      }
    });
  });

  observer.observe(element);
};

export const filterVisibleElements = (elements: NodeListOf<HTMLElement>) => {
  const visibleElements: HTMLElement[] = [];

  // MUST work with original NodeList.forEach
  elements.forEach((element) =>
    isElementInViewport(element, (isVisible) => {
      if (isVisible) visibleElements.push(element);
    })
  );

  // return visibleElements;

  console.log('==============', 'visibleElements.length:', visibleElements.length);
  console.log('==============', 'visibleElements', visibleElements);

  const selector = visibleElements.map((element) => {
    console.log('element', element);
    // return `#${element.id}`;
  });

  // .join(',');
  console.log('selector', selector);

  // const selectedElements = document.querySelectorAll(selector);
  return [];
};

// nepouzdano
let previousUrl = '';
const observer = new MutationObserver(() => {
  console.log('location.href', location.href);
  console.log('previousUrl', previousUrl);
  if (location.href !== previousUrl) {
    console.log('URL CHANGED');
    alert('URL CHANGED 1');

    previousUrl = location.href;
    debouncedDOMReadyHandler();

    // observer.disconnect();
  }
});

const onUrlChange = () => {
  observer.observe(document, { subtree: true, childList: true });
  document.addEventListener('beforeunload', () => observer.disconnect());
};

//------------------

// onUrlChange

console.log('bilo sta');

const onUrlChange = () => {
  let currentUrl = location.href;
  setInterval(() => {
    console.log('setInterval');

    if (currentUrl !== location.href) {
      currentUrl = location.href;
      alert('url changed 123');
      debouncedDOMReadyHandler();
    }
  }, checkUrlInterval);
};

export const onDOMReady = () => {
  console.log('document.readyState', document.readyState);
  if (document.readyState === 'loading') { // uvek je document.readyState === completed, uvek else grana, beskoristan
    alert('document.readyState === loading');

    document.addEventListener('DOMContentLoaded', debouncedDOMReadyHandler);
  } else {
    alert('else');

    debouncedDOMReadyHandler();
  }
};


const handleScroll = () => console.log('handleScroll');

document.addEventListener('scroll', handleScroll);

document.removeEventListener('scroll', handleScroll);


const timestampId = getTimestampIdFromCommentId(commentElement.id);
const timestampElement = document.querySelector<HTMLElement>(`#${timestampId}`);
const timestamp = timestampElement?.textContent;


// only elements with ids, unused
export const filterVisibleElements = (elements: NodeListOf<HTMLElement>) => {
  const visibleElements: HTMLElement[] = [];

  // MUST work with original NodeList.forEach
  elements.forEach((element) => {
    if (isElementInViewport(element)) visibleElements.push(element);
  });

  const selector = visibleElements.map((element) => `#${element.id}`).join(',');

  const selectedElements = document.querySelectorAll(selector);
  return selectedElements;
};