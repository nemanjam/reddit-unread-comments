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
import { applyFormToDom, messageTypes, MyMessageType, sendMessage } from '../message';
import { deleteAllThreadsWithComments, getAllDbData } from '../database/limit-size';

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

  //! CANT USE DB, write generic function to get db data

  // pre-populate form from db
  useEffect(() => {
    const populateFormFromDb = async () => {
      try {
        const message: MyMessageType = { type: messageTypes.GET_SETTINGS_DATA_FROM_DB };
        const response: MyMessageType = await sendMessage(message);

        const settings: SettingsData = response.payload;
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
    const db = await openDatabase();

    switch (radioValue) {
      case 'thread':
        // must send message for threadId
        // deleteThreadWithComments(threadId)
        break;
      case 'all-threads':
        const dbData1 = await getAllDbData(db);
        console.error('dbData1', JSON.stringify(dbData1, null, 2));
        console.error(`Database Name: ${db.name}, Version: ${db.version}`);

        // const success = await deleteAllThreadsWithComments(db);

        // const dbData2 = await getAllDbData(db);
        // console.error('dbData2', JSON.stringify(dbData2, null, 2));

        setReloadFormIndex((prev) => prev + 1); // reset for from db
        break;
      case 'user-settings':
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
