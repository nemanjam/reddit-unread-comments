
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
