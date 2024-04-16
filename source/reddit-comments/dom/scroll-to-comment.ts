import {
  highlightedCommentByDateClass,
  highlightedCommentClass,
} from '../constants/config';
import { pageHeaderSelector } from '../constants/selectors';
import { getSettings } from '../database/models/settings';
import { openDatabase } from '../database/schema';
import { MyElementNotFoundDOMException } from '../exceptions';
import { isElementInViewport } from './highlight-common';

export const getHeaderHeight = () => {
  const headerElement = document.querySelector(pageHeaderSelector);
  if (!headerElement)
    throw new MyElementNotFoundDOMException('Header element not found.');

  const headerHeight = headerElement.getBoundingClientRect().height;
  return headerHeight;
};

const createCurrentIndexUpdater = () => {
  // state
  let currentIndex = 0;

  const getCurrentIndex = () => currentIndex;

  const setCurrentIndex = (value: number) => {
    currentIndex = value;
  };

  return {
    getCurrentIndex,
    setCurrentIndex,
  };
};

/** Use only this instance. */
export const currentIndex = createCurrentIndexUpdater();

export const scrollNextCommentIntoView = async (scrollToFirstComment = false) => {
  const db = await openDatabase();
  const settingsData = await getSettings(db);

  const highlightedCommentsSelector = `.${highlightedCommentClass}`;
  const highlightedCommentsByDateSelector = `.${highlightedCommentByDateClass}`;

  const commentsSelectorMap = {
    unread: highlightedCommentsSelector,
    'by-date': highlightedCommentsByDateSelector,
    both: `${highlightedCommentsSelector}, ${highlightedCommentsByDateSelector}`,
  };
  const chosenCommentsSelector = commentsSelectorMap[settingsData.scrollTo];

  const commentElements = document.querySelectorAll<HTMLElement>(chosenCommentsSelector);

  if (!(commentElements.length > 0)) return;

  if (scrollToFirstComment) {
    // scroll to first highlighted comment
    currentIndex.setCurrentIndex(0);
  } else {
    // find currentIndex for first element that is not in viewport
    for (
      let index = currentIndex.getCurrentIndex();
      index < commentElements.length;
      index++
    ) {
      if (!isElementInViewport(commentElements[index])) {
        currentIndex.setCurrentIndex(index);
        break;
      }

      // last iteration
      if (index > commentElements.length - 2) {
        currentIndex.setCurrentIndex(0);
      }
    }
  }

  const commentElement = commentElements[currentIndex.getCurrentIndex()];
  const commentRect = commentElement.getBoundingClientRect();
  const headerHeight = getHeaderHeight();

  window.scrollTo({
    top: commentRect.top + window.scrollY - headerHeight,
    behavior: 'smooth',
  });
};
