import React, { FC } from 'react';
import { Theme, Container, Separator } from '@radix-ui/themes';

import SectionTime from './section-time';
import SectionUnHighlight from './section-unhighlight';
import SectionDatabase from './section-database';
import SectionScroll from './section-scroll';
import SectionSort from './section-sort';
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
          <Separator size="4" my="4" />
          <SectionDatabase />
          <Separator size="4" my="4" />
          <SectionScroll />
          <Separator size="4" my="4" />
          <SectionSort />
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
// radio scroll to unread, scroll to by date, scroll to both
// radio sort by new
// github url

// fix checked radio style
