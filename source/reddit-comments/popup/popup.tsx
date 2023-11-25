import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Theme, Container, Separator, Flex } from '@radix-ui/themes';

import SectionTime from './section-time';
import SectionUnHighlight from './section-unhighlight';
import SectionDatabase from './section-database';
import SectionScroll from './section-scroll';
import SectionSort from './section-sort';
import SectionLink from './section-link';

import './popup.scss';
import { SettingsData } from '../database/schema';
import { defaultValues } from '../database/models/settings';

const Popup: FC = () => {
  const form = useForm<SettingsData>({
    mode: 'onChange',
    defaultValues,
  });
  const { getValues, watch } = form;

  // todo: prepopulate form from db settings

  console.error('getValues', getValues(), 'watch', watch());

  const handleResetDb = () => {
    // todo
    const radioValue = getValues('resetDb');
    console.error('radioValue', radioValue);
  };

  return (
    <Theme radius="medium">
      <Container id="popup" p="4">
        <form>
          <SectionTime form={form} />
          <Separator size="4" my="4" />
          <Flex>
            <SectionUnHighlight form={form} />
            <Separator orientation="vertical" size="3" mx="4" />
            <SectionScroll form={form} />
          </Flex>
          <Separator size="4" my="4" />
          <SectionSort form={form} />
          <Separator size="4" my="4" />
          <SectionDatabase form={form} onResetClick={handleResetDb} />
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
