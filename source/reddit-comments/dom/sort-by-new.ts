import { sortMenuWait } from '../constants/config';
import {
  currentlySelectedItemSelector,
  sortByNewMenuItemSelector,
  sortMenuShadowHostSelector,
  sortMenuClickSelector,
} from '../constants/selectors';
import { MyElementNotFoundDOMException } from '../exceptions';
import { wait } from '../utils';

/** Returns true if it wasn't by new already. */
export const clickSortByNewMenuItem = async (): Promise<boolean> => {
  // get currently selected sort order

  // same shadowHost is reused for currently selected item and dropdown menu click
  const shadowHost = document.querySelector(sortMenuShadowHostSelector);
  const shadowRoot = shadowHost?.shadowRoot;

  if (!shadowRoot)
    throw new MyElementNotFoundDOMException(
      `shadowRoot not found. sortMenuShadowHostSelector: ${sortMenuShadowHostSelector}`
    );

  const currentlySelectedElement = shadowRoot.querySelector(
    currentlySelectedItemSelector
  );
  const currentlySelectedElementText = currentlySelectedElement?.textContent;
  if (!currentlySelectedElementText)
    throw new MyElementNotFoundDOMException(
      `currentlySelectedElementText not found. currentlySelectedElementText: ${currentlySelectedElementText}`
    );

  const currentlySelectedText = currentlySelectedElementText.toLowerCase();
  if (currentlySelectedText.includes('new')) return false; // new already

  // get dropdown menu
  const sortMenu = shadowRoot.querySelector<HTMLElement>(sortMenuClickSelector);
  if (!sortMenu)
    throw new MyElementNotFoundDOMException(
      `sortMenu not found. sortMenuClickSelector: ${sortMenuClickSelector}`
    );
  sortMenu.click();

  await wait(sortMenuWait);

  // get items
  const menuItems = document.querySelectorAll<HTMLElement>(sortByNewMenuItemSelector);

  if (!(menuItems?.length > 0))
    throw new MyElementNotFoundDOMException(
      `menuItems not found. sortByNewMenuItemSelector: ${sortByNewMenuItemSelector}`
    );

  let sortByNewMenuItem: HTMLElement | null = null;
  menuItems.forEach((element) => {
    const itemText = element.textContent;
    if (itemText?.toLowerCase().includes('new')) sortByNewMenuItem = element;
  });

  if (sortByNewMenuItem) {
    (sortByNewMenuItem as HTMLElement).click();

    // remove :focus-visible border
    sortMenu.blur();
  }

  return true;
};
