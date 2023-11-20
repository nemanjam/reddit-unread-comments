import React, { FC } from 'react';
import { browser, Tabs } from 'webextension-polyfill-ts';

import './popup.scss';

// not needed
const openWebPage = (url: string): Promise<Tabs.Tab> => browser.tabs.create({ url });

const Popup: FC = () => {
  return (
    <section>
      <h2>My Popup</h2>
      <a
        href="https://github.com/nemanjam/reddit-unread-comments"
        // onClick={() => openWebPage('https://github.com/nemanjam/reddit-unread-comments')}
      >
        https://github.com/nemanjam/reddit-unread-comments
      </a>
    </section>
  );
};

export default Popup;
