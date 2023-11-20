import React, { FC } from 'react';
import * as Slider from '@radix-ui/react-slider';

import './popup.scss';

const repoUrl = 'https://github.com/nemanjam/reddit-unread-comments';

const Popup: FC = () => {
  return (
    <section id="popup-container" className="p-4">
      <form>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-5"
          defaultValue={[50]}
          max={100}
          step={1}
        >
          <Slider.Track className="bg-blackA7 relative grow rounded-full h-[3px]">
            <Slider.Range className="absolute bg-white rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white shadow-[0_2px_10px] shadow-blackA4 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA5"
            aria-label="Volume"
          />
        </Slider.Root>
        <a href={repoUrl}>{repoUrl}</a>
      </form>
    </section>
  );
};

export default Popup;

// time slider and scale radio
// radio unhighlight mode: scroll, url-change
// buttons clear database, clear thread
// radio sort by new
// radio scroll to unread, scroll to by date, scroll to both
// github url
