import { scrollDebounceWait } from '../constants/config';
import { handleScrollDom } from '../dom/handle-scroll';
import { debounce } from '../utils';

/*-------------------------------- onScroll ------------------------------*/

const handleScroll = () => handleScrollDom();
export const debouncedScrollHandler = debounce(handleScroll, scrollDebounceWait);
