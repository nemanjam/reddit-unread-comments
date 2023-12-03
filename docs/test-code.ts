
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


export const updateCommentsSessionCreatedAtForThread = (
  db: IDBDatabase,
  threadId: string,
  sessionCreatedAt: number
): Promise<CommentData[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CommentObjectStore], 'readwrite');
    const commentObjectStore = transaction.objectStore(CommentObjectStore);

    const index = commentObjectStore.index('ThreadIdIndex');

    const getRequest = index.getAll(threadId);

    getRequest.onsuccess = (event: any) => {
      const comments = event.target.result;

      if (comments && comments.length > 0) {
        const updateTransaction = db.transaction([CommentObjectStore], 'readwrite');
        const updateObjectStore = updateTransaction.objectStore(CommentObjectStore);
        const updatedComments: CommentData[] = [];

        comments.forEach((comment: CommentData) => {
          if (comment.sessionCreatedAt === currentSessionCreatedAt) {
            // Update only comments with sessionCreatedAt === 2e12
            comment.sessionCreatedAt = sessionCreatedAt;
            updateObjectStore.put(comment);
            updatedComments.push(comment);
          }
        });

        updateTransaction.oncomplete = () => {
          console.log('SessionCreatedAt updated successfully');
          resolve(updatedComments); // Resolve with the updated comments
        };

        updateTransaction.onerror = (error: any) => {
          console.error('Error updating SessionCreatedAt:', error);
          reject(error);
        };
      } else {
        console.warn('No comments found for the specified threadId:', threadId);
        resolve([]); // Resolve with an empty array since there are no comments to update
      }
    };

    getRequest.onerror = (error: any) => {
      console.error('Error retrieving comments:', error);
      reject(error);
    };
  });
};


// get all threads for debugging
export const getThreads = async (db: IDBDatabase): Promise<ThreadData[]> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction('ThreadObjectStore', 'readonly');
    const threadObjectStore = transaction.objectStore('ThreadObjectStore');
    const getAllRequest = threadObjectStore.getAll();

    getAllRequest.onsuccess = () => {
      const threads = getAllRequest.result as ThreadData[];
      resolve(threads);
    };

    getAllRequest.onerror = () => reject(transaction.error);
  });


  // unhilight in real time...
// za realtime ovde treba addOrUpdate // ETO, db baca exception
// ne treba da pokusava da doda comment sa istim id, baca exception
// puca baza ovde, to je problem
const commentData = await addComment(db, {
  threadId,
  commentId,
  sessionCreatedAt: thread.updatedAt,
});

// jedina fora ovde, mora baza da se instancira jer se prva zatvori
setTimeout(async () => {
  const db = await openDatabase(); 

  const commentData = await addComment(db, {
    threadId,
    commentId,
    sessionCreatedAt: thread.updatedAt,
  });

  console.log('commentId', commentId, 'commentData', commentData);
}, 5000);

// na kraju ovo je bacalo exception?
commentData.id umesto commentData.commentId

export const addOrUpdateComment = async (
  db: IDBDatabase,
  commentData: CommentData
): Promise<CommentData> => {
  const existingComment = await getComment(db, commentData.commentId);

  if (existingComment) {
    const updatedComment = await updateComment(db, commentData);
    return updatedComment;
  }

  const newComment = await addComment(db, commentData);
  return newComment;
};

const hasArrivedToThreadNotSortedByNew =
isRedditThread(currentUrl) &&
hasArrivedToRedditThread(previousUrl, currentUrl) &&
!hasSortByNewQueryParam(currentUrl);

console.log('hasArrivedToThreadNotSOrtedByNew', hasArrivedToThreadNotSortedByNew);

if (hasArrivedToThreadNotSortedByNew) {
// sort comments by new
history.replaceState({}, '', getSortByNewUrl(currentUrl));
// trigger next change
// return;
}

// scroll comment to top in modal and in window
const headerHeight = getHeaderHeight();

if (modalScrollContainer) {
  const commentOffsetTop = commentElement.getBoundingClientRect().top;
  const modalOffsetTop = modalScrollContainer.getBoundingClientRect().top;

  const targetScrollTop =
    modalScrollContainer.scrollTop + commentOffsetTop - modalOffsetTop - headerHeight;

  modalScrollContainer.scrollTo({
    top: targetScrollTop,
    behavior: 'smooth',
  });
} else {
  window.scrollTo({
    top: commentRect.top + window.scrollY - headerHeight,
    behavior: 'smooth',
  });
}
//----------------

interface CommentWithDate {
  commentId: string;
  /** Date object, Timestamp in db. */
  date: Date;
}
interface SortedResult {
  latestComment: CommentWithDate;
  sortedComments: CommentWithDate[];
}

// todo: compare comments from database too, no they are older
/** Used only for max elem for Thread.latestCommentId in db. */
const createSortedCommentsByDateUpdater = () => {
  let comments: CommentWithDate[] = [];
  let latestComment: CommentWithDate | null = null;

  const updateSortedComments = (commentId: string) => {
    const newComment = { commentId, date: getDateFromCommentId(commentId) };
    comments.push(newComment);

    comments.sort((a, b) => b.date.getTime() - a.date.getTime());
    latestComment = comments[0];
  };

  const reset = (commentElement: HTMLElement) => {
    const initialCommentId = validateCommentElementIdOrThrow(commentElement);
    const initialComment: CommentWithDate = {
      commentId: initialCommentId,
      date: getDateFromCommentId(initialCommentId),
    };

    comments = [initialComment];
    latestComment = initialComment;
  };

  const getFilteredNewerCommentsByDate = (date: Date): CommentWithDate[] => {
    checkIfEmptyCommentsArray('getFilteredNewerCommentsByDate');

    return comments.filter((comment) => comment.date.getTime() > date.getTime());
  };

  const getSortedComments = (): SortedResult => {
    checkIfEmptyCommentsArray('getSortedComments');

    const sortedResult = { latestComment, sortedComments: comments } as SortedResult;
    return sortedResult;
  };

  const checkIfEmptyCommentsArray = (fnName: string) => {
    if (!latestComment || !(comments.length > 0))
      throw new MyElementNotFoundDOMException(
        `sortedCommentsByDateUpdater.${fnName} called with empty comments array.`
      );
  };

  return {
    reset,
    updateSortedComments,
    getSortedComments,
    getFilteredNewerCommentsByDate,
  };
};

/** Global. */
const sortedCommentsByDateUpdater = createSortedCommentsByDateUpdater();

  // reset slider and radio on switch false
  useEffect(() => {
    const populateFormFromDb = async () => {
      const db = await openDatabase();
      const settings = await getSettings(db);

      if (settings) {
        setValue('timeSlider', settings.timeSlider); // with values from db
        setValue('timeScale', settings.timeScale);
      }
    };

    // on transition only
    if (isDisabledSection && prevIsDisabledSection !== isDisabledSection) {
      populateFormFromDb();
    }
  }, [isDisabledSection, prevIsDisabledSection]);

  // reset slider on radio change
  useEffect(() => {
    const populateFormFromDb = async () => {
      const db = await openDatabase();
      const settings = await getSettings(db);

      if (settings) {
        setValue(
          'timeSlider',
          settings.timeSlider // with value from db
        );
      }
    };

    populateFormFromDb();
    if (prevTimeScale !== timeScale) populateFormFromDb();
  }, [timeScale, prevTimeScale]);

  export const debounce = <T extends (...args: any[]) => Promise<void>>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    let resolveFn: (() => void) | null = null;
  
    const debouncedFunction = async function (...args: Parameters<T>) {
      clearTimeout(timeout);
  
      return new Promise<void>((resolve) => {
        resolveFn = resolve;
        timeout = setTimeout(async () => {
          await func.apply(window, args);
          if (resolveFn) {
            resolveFn();
            resolveFn = null;
          }
        }, wait);
      });
    };
  
    return debouncedFunction;
  };
//-----------------------
import { browser } from 'webextension-polyfill-ts';

export interface MyMessageType {
  type: string;
  payload: any;
}

const sendMessageToContentScript = (message: MyMessageType) => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const activeTab = tabs[0];

    if (activeTab?.id) {
      browser.tabs
        .sendMessage(activeTab.id, message)
        .then((response: any) => {
          // Handle the response if needed
          console.log('Response from content script:', response);
        })
        .catch((error: Error) => {
          console.error('Error sending message to content script:', error);
        });
    } else {
      console.error('No active tab found.');
    }
  });
};

// Example usage:
const myState = {
  /* your state data */
};
sendMessageToContentScript({ type: 'UPDATE_STATE', payload: myState });


const createDebouncedUrlChangeHandler = async (func: AnyFunction) => {
  const db = await openDatabase();
  const { sortAllByNew } = await getSettings(db);

  const debounceWait = sortAllByNew
    ? urlChangeDebounceWaitWithSortByNew
    : urlChangeDebounceWait;

  // must wait for redirect and page content load
  const debouncedUrlChangeHandler = debounce(func, debounceWait);
  return debouncedUrlChangeHandler;
};