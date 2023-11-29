import React, { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Theme, Container, Separator, Flex, Text } from '@radix-ui/themes';

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
  getSettings,
  resetSettings,
  updateSettings,
} from '../database/models/settings';
import useIsMounting from './useIsMounting';
import { formSubmitDebounceWait } from '../constants';
import { debounce } from '../utils';
import { applyFormToDom } from '../message';

const Popup: FC = () => {
  const [reloadFormIndex, setReloadFormIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { isMounting } = useIsMounting();

  const form = useForm<SettingsData>({
    mode: 'onChange',
    defaultValues,
  });
  const { reset, getValues, watch, handleSubmit } = form;

  // console.error('getValues', getValues(), 'watch', watch());

  // pre-populate form from db
  useEffect(() => {
    const populateFormFromDb = async () => {
      try {
        const db = await openDatabase();
        const settings = await getSettings(db);
        console.error('populated settings', settings);

        // resetDb is not persisted in db
        reset({ ...settings, resetDb: defaultValues.resetDb });
      } catch (error) {
        console.error('Populating settings failed, error:', error);
      }
      setIsLoading(false);
    };

    populateFormFromDb();
  }, [reloadFormIndex]);

  const onSubmit = async (settingsData: SettingsData) => {
    // first update db so others can read
    const db = await openDatabase();
    const previousSettingsData = await getSettings(db); // only correct place to get prev settings

    await updateSettings(db, settingsData);

    // apply changes
    await applyFormToDom(previousSettingsData, settingsData);
  };

  const debouncedHandleSubmit = debounce(
    () => handleSubmit(onSubmit)(),
    formSubmitDebounceWait
  );

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

  if (isLoading) return <Text as="div">Loading...</Text>;

  return (
    <Theme radius="medium">
      <Container id="popup" p="4">
        <form onChange={debouncedHandleSubmit}>
          <SectionTime
            form={form}
            // this causes race, fix it
            isPopupMounting={isMounting}
          />
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
