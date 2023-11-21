import React, { FC } from 'react';
import { Theme, Flex, Text, Button, Slider } from '@radix-ui/themes';

import './popup.scss';

const repoUrl = 'https://github.com/nemanjam/reddit-unread-comments';

const Popup: FC = () => {
  return (
    <Theme>
      <main id="popup" className="p-4">
        <section className="w-fit h-fit bg-gray-300 border border-solid border-red-500 ">
          <form>
            <h1 className="bg-red-400">my content</h1>
            <h1>my content 2</h1>
            <h1>my content 3</h1>
            <Slider defaultValue={[50]} />
          </form>
          <a href={repoUrl}>{repoUrl}</a>
          <Flex direction="column" gap="2">
            <Text>Hello from Radix Themes :)</Text>
            <Button>Let's go</Button>
          </Flex>
        </section>
      </main>
    </Theme>
  );
};

export default Popup;

// time slider and scale radio
// radio unhighlight mode: scroll, url-change
// buttons clear database, clear thread
// radio sort by new
// radio scroll to unread, scroll to by date, scroll to both
// github url
