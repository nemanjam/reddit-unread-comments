import { scrollNextCommentIntoView } from '../dom/scroll-to-comment';

/*------------------------------- onKeyDown -----------------------------*/

export const handleCtrlSpaceKeyDown = async (event: KeyboardEvent) => {
  // ctrl + shift + space -> scroll to first
  if (event.ctrlKey && event.code === 'Space') {
    if (event.shiftKey) {
      await scrollNextCommentIntoView(true);
    } else {
      await scrollNextCommentIntoView();
    }
  }
};
