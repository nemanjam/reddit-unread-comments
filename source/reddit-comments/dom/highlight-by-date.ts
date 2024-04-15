import { highlightedCommentByDateClass } from '../constants/config';
import { getSettings } from '../database/models/settings';
import { openDatabase } from '../database/schema';
import { radioAndSliderToDate } from '../datetime';
import { validateCommentElementIdOrThrow } from '../validation';
import { addClass, removeClass } from './highlight-common';
import { getDateFromCommentId } from './timestamp';

export const getFilteredNewerCommentsByDate = (
  commentElements: HTMLElement[],
  newerThan: Date
): HTMLElement[] => {
  const filteredComments = commentElements.filter((commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);
    const commentDate = getDateFromCommentId(commentId); // here it throws
    return commentDate.getTime() > newerThan.getTime();
  });

  return filteredComments;
};

/** Works only with DOM elements, no database. */
export const highlightByDate = (
  commentElements: NodeListOf<HTMLElement>,
  newerThan: Date
): void => {
  const commentsArray = Array.from(commentElements);
  const filteredComments = getFilteredNewerCommentsByDate(commentsArray, newerThan);
  const filteredCommentsIds = filteredComments.map((commentElement) => commentElement.id);

  commentElements.forEach((commentElement) => {
    const commentId = validateCommentElementIdOrThrow(commentElement);

    const isCommentNewerThan = filteredCommentsIds.includes(commentId);

    // both highlight and un-highlight always, slider can change

    // highlighting
    if (isCommentNewerThan) {
      addClass(commentElement, highlightedCommentByDateClass);
    }

    // un-highlighting
    if (!isCommentNewerThan) {
      removeClass(commentElement, highlightedCommentByDateClass);
    }
  });
};

/** Only this one should be used. */
export const highlightByDateWithSettingsData = async (
  commentElements: NodeListOf<HTMLElement>
) => {
  const db = await openDatabase();
  const settings = await getSettings(db);
  const { isHighlightOnTime, timeScale, timeSlider } = settings;

  if (isHighlightOnTime) {
    const dateInPast = radioAndSliderToDate({ timeScale, timeSlider });
    highlightByDate(commentElements, dateInPast);
  }
};
