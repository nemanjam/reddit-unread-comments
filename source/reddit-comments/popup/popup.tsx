import React, { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Theme, Container, Separator, Flex } from '@radix-ui/themes';

import SectionTime from './section-time';
import SectionUnHighlight from './section-unhighlight';
import SectionDatabase from './section-database';
import SectionScroll from './section-scroll';
import SectionSort from './section-sort';
import SectionLink from './section-link';

import './popup.scss';
import { openDatabase, SettingsData } from '../database/schema';
import {
  defaultValues,
  getOrCreateSettings,
  resetSettings,
  updateSettings,
} from '../database/models/settings';

const Popup: FC = () => {
  const [reloadFormIndex, setReloadFormIndex] = useState(0);

  const form = useForm<SettingsData>({
    mode: 'onChange',
    defaultValues,
  });
  const { reset, getValues, watch, handleSubmit } = form;

  // console.error('getValues', getValues(), 'watch', watch());

  // pre-populate form from db
  useEffect(() => {
    const populateFormFromDb = async () => {
      const db = await openDatabase();
      const settings = await getOrCreateSettings(db);

      if (settings) {
        console.error('populated settings', settings);
        reset(settings);
      }
    };

    populateFormFromDb();
  }, [reloadFormIndex]);

  const onSubmit = async (settingsData: SettingsData) => {
    const db = await openDatabase();
    await updateSettings(db, settingsData);
  };

  const handleResetDb = async () => {
    const radioValue = getValues('resetDb');

    switch (radioValue) {
      case 'thread':
        break;
      case 'all-threads':
        break;
      case 'user-settings':
        const db = await openDatabase();
        await resetSettings(db);
        setReloadFormIndex((prev) => prev + 1); // trigger useEffect
        break;

      default:
        break;
    }
  };

  return (
    <Theme radius="medium">
      <Container id="popup" p="4">
        <form onChange={handleSubmit(onSubmit)}>
          <SectionTime form={form} onSubmit={onSubmit} />
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
