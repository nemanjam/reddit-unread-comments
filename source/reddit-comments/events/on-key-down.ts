import { scrollNextCommentIntoView } from '../dom/scroll-to-comment';
import { isActiveTabAndRedditThreadAndHasComments } from '../utils';

/*------------------------------- onKeyDown -----------------------------*/

export const handleCtrlSpaceKeyDown = async (event: KeyboardEvent) => {
  const { isOk } = isActiveTabAndRedditThreadAndHasComments();
  if (!isOk) return;

  // ctrl + shift + space -> scroll to first
  if (event.ctrlKey && event.code === 'Space') {
    if (event.shiftKey) {
      await scrollNextCommentIntoView(true);
    } else {
      await scrollNextCommentIntoView();
    }
  }
};
