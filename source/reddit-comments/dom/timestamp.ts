import { getTimestampSelectorFromId } from '../constants/selectors';
import {
  MyElementAttributeNotValidDOMException,
  MyElementNotFoundDOMException,
} from '../exceptions';

export const getTimestampElementFromCommentId = (commentId: string) => {
  const timestampSelector = getTimestampSelectorFromId(commentId);
  const timestampElement = document.querySelector<HTMLElement>(timestampSelector);

  return timestampElement;
};

export const getDateFromCommentId = (commentId: string): Date => {
  const timestampElement = getTimestampElementFromCommentId(commentId);

  if (!timestampElement)
    throw new MyElementNotFoundDOMException(
      `Comment timestamp element with commentId: ${commentId} not found.`
    );

  const dateIsoString = timestampElement.getAttribute('datetime');

  if (!dateIsoString)
    throw new MyElementAttributeNotValidDOMException(
      `getDateFromCommentId dateIsoString: ${dateIsoString}, date.datetime attribute not defined.`
    );

  const date = new Date(dateIsoString);
  return date;
};
