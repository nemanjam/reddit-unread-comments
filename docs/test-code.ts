
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
  