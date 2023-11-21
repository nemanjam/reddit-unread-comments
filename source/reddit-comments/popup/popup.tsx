import React, { FC } from 'react';
import { Theme, Text, Link, Box, Container, Separator } from '@radix-ui/themes';

import SectionTime from './section-time';
import SectionUnHighlight from './section-unhighlight';
import SectionLink from './section-link';

import './popup.scss';

const Popup: FC = () => {
  return (
    <Theme radius="medium">
      <Container id="popup" p="4">
        <form>
          <SectionTime />
          <Separator size="4" my="4" />
          <SectionUnHighlight />
        </form>
        <Separator size="4" my="4" />
        <SectionLink />
      </Container>
    </Theme>
  );
};

export default Popup;

// time slider and scale radio
// radio unhighlight mode: scroll, url-change
// buttons clear database, clear thread, clear settings
// radio sort by new
// radio scroll to unread, scroll to by date, scroll to both
// github url
