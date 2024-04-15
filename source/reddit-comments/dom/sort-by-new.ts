import { sortMenuWait } from '../constants/config';
import {
  sortByNewMenuItemSelector,
  sortMenuSelector,
  sortMenuSpanTextSelector,
} from '../constants/selectors';
import { wait } from '../utils';

/** Returns true if it wasn't by new already. */
export const clickSortByNewMenuItem = async (): Promise<boolean> => {
  // check if its new already
  const sortMenuSpan = document.querySelector<HTMLElement>(sortMenuSpanTextSelector);
  if (!sortMenuSpan) return false;

  if ((sortMenuSpan.textContent as string).toLowerCase().includes('new')) return false; // new already

  // get menu
  const sortMenu = document.querySelector<HTMLElement>(sortMenuSelector);
  if (!sortMenu) return false;

  sortMenu.click();
  await wait(sortMenuWait);

  // get items
  const menuItems = document.querySelectorAll<HTMLElement>(sortByNewMenuItemSelector);

  let sortByNewMenuItem: HTMLElement | null = null;
  menuItems.forEach((element) => {
    if ((element.textContent as string).toLowerCase().includes('new'))
      sortByNewMenuItem = element;
  });

  if (sortByNewMenuItem) {
    (sortByNewMenuItem as HTMLElement).click();
    sortMenu.blur(); // remove :focus-visible border
  }

  return true;
};
