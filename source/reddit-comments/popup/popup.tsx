import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Theme, Container, Separator, Flex, Text } from '@radix-ui/themes';

import SectionTime from './section-time';
import SectionUnread from './section-unread';
import SectionDatabase from './section-database';
import SectionScroll from './section-scroll';
import SectionSort from './section-sort';
import SectionLink from './section-link';

import './popup.scss';
import { SettingsData } from '../database/schema';
import { defaultValues } from '../database/models/settings';
import {
  calcHighlightOnTimeDebounceWait,
  formSubmitDebounceWait,
  highlightedCommentsCountInterval,
  markAllAsReadDbAndDomWait,
} from '../constants/config';
import { debounceTrailing, isRedditThread, wait } from '../utils';
import { messageTypes, MyMessageType, sendMessage } from '../message';
import SectionLogger from './section-logger';
import logger from '../logger';

const Popup: FC = () => {
  const [reloadFormIndex, setReloadFormIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedOnTimeCount, setHighlightedOnTimeCount] = useState(0);
  const [highlightedUnreadCount, setHighlightedUnreadCount] = useState(0);
  const [pageUrl, setPageUrl] = useState('');

  const form = useForm<SettingsData>({
    mode: 'onChange',
    defaultValues,
  });
  const { reset, getValues, watch, handleSubmit, resetField } = form;

  const timeScale = watch('timeScale');
  const timeSlider = watch('timeSlider');
  const isHighlightOnTime = watch('isHighlightOnTime');
  const isHighlightUnread = watch('isHighlightUnread');
  const markAllAsRead = watch('markAllAsRead');

  //! CANT USE DB, write generic function to get db data

  // get page url
  useEffect(() => {
    const getPageUrl = async () => {
      const message: MyMessageType = {
        type: messageTypes.GET_PAGE_URL,
      };
      const response: MyMessageType = await sendMessage(message);
      const pageUrl = response.payload;

      setPageUrl(pageUrl);
    };

    getPageUrl();
  }, []);

  // pre-populate form from db
  useEffect(() => {
    const populateFormFromDb = async () => {
      try {
        const message: MyMessageType = { type: messageTypes.GET_SETTINGS_DATA_FROM_DB };
        const response: MyMessageType = await sendMessage(message);

        const settingsData: SettingsData = response.payload;
        const { resetDb, markAllAsRead } = defaultValues;

        reset({ ...settingsData, resetDb, markAllAsRead });
      } catch (error) {
        logger.error('Populating settings failed, error:', error);
      }
      setIsLoading(false);
    };

    populateFormFromDb();
  }, [reloadFormIndex]);

  // calc highlight on time onChange too
  useEffect(() => {
    const getHighlightedOnTimeCount = async () => {
      const message: MyMessageType = {
        type: messageTypes.CALC_HIGHLIGHTED_ON_TIME_COUNT,
      };
      const response: MyMessageType = await sendMessage(message);
      const highlightedOnTimeCount = response.payload;

      setHighlightedOnTimeCount(highlightedOnTimeCount);
    };

    const debouncedGetHighlightedOnTimeCount = debounceTrailing(
      getHighlightedOnTimeCount,
      calcHighlightOnTimeDebounceWait
    );

    const onChange = async () => {
      if (isHighlightOnTime) await debouncedGetHighlightedOnTimeCount();
    };

    onChange();
  }, [isHighlightOnTime, timeScale, timeSlider]);

  // re-calc unread comments after markAllAsRead
  useEffect(() => {
    const getHighlightedUnreadCount = async () => {
      // wait for db and dom to update
      await wait(markAllAsReadDbAndDomWait);

      const message: MyMessageType = {
        type: messageTypes.CALC_HIGHLIGHTED_UNREAD_COUNT,
      };
      const response: MyMessageType = await sendMessage(message);
      const highlightedUnreadCount = response.payload;

      setHighlightedUnreadCount(highlightedUnreadCount);

      resetField('markAllAsRead');
    };

    if (markAllAsRead) {
      getHighlightedUnreadCount();
    }
  }, [markAllAsRead]);

  // refetch count of highlighted comments while popup is open
  useEffect(() => {
    const intervalFunction1 = async () => {
      const message: MyMessageType = {
        type: messageTypes.CALC_HIGHLIGHTED_ON_TIME_COUNT,
      };
      const response: MyMessageType = await sendMessage(message);
      const highlightedOnTimeCount = response.payload;

      setHighlightedOnTimeCount(highlightedOnTimeCount);
    };

    const intervalFunction2 = async () => {
      const message: MyMessageType = {
        type: messageTypes.CALC_HIGHLIGHTED_UNREAD_COUNT,
      };
      const response: MyMessageType = await sendMessage(message);
      const highlightedUnreadCount = response.payload;

      setHighlightedUnreadCount(highlightedUnreadCount);
    };

    const intervalFunction = async () => {
      if (isHighlightOnTime) await intervalFunction1();
      if (isHighlightUnread) await intervalFunction2();
    };

    const intervalId = setInterval(intervalFunction, highlightedCommentsCountInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isHighlightOnTime, isHighlightUnread]);

  const onSubmit = async (settingsData: SettingsData) => {
    const message: MyMessageType = {
      type: messageTypes.SUBMIT_SETTINGS_DATA,
      payload: settingsData,
    };
    await sendMessage(message);
  };

  const debouncedHandleSubmit = debounceTrailing(
    () => handleSubmit(onSubmit)(),
    formSubmitDebounceWait
  );

  const handleResetDb = async () => {
    const radioValue = getValues('resetDb');

    switch (radioValue) {
      case 'thread': {
        const message: MyMessageType = {
          type: messageTypes.RESET_THREAD_DATA,
        };
        await sendMessage(message);
        resetField('resetDb');
        break;
      }
      case 'all-threads': {
        const message: MyMessageType = {
          type: messageTypes.RESET_ALL_THREADS_DATA,
        };
        await sendMessage(message);
        resetField('resetDb'); // reset radio only
        break;
      }
      case 'user-settings': {
        const message: MyMessageType = {
          type: messageTypes.RESET_SETTINGS_DATA,
        };
        await sendMessage(message);
        setReloadFormIndex((prev) => prev + 1); // trigger useEffect
        break;
      }

      default:
        break;
    }
  };

  if (!isRedditThread(pageUrl))
    return (
      <ReturnText>You must be on Reddit thread to load User Settings window.</ReturnText>
    );

  if (isLoading) return <ReturnText>Loading...</ReturnText>;

  return (
    <ThemeWithContainer>
      <form onChange={debouncedHandleSubmit}>
        <SectionTime form={form} count={highlightedOnTimeCount} />
        <Separator size="4" my="4" />
        <Flex style={{ height: 125 }}>
          <SectionUnread form={form} count={highlightedUnreadCount} />
          <Separator orientation="vertical" size="4" mx="4" />
          <SectionScroll form={form} />
        </Flex>
        <Separator size="4" my="4" />
        <Flex align="center">
          <SectionSort form={form} />
          <Separator orientation="vertical" size="2" mx="4" />
          <SectionLogger form={form} />
        </Flex>
        <Separator size="4" my="4" />
        <SectionDatabase form={form} onResetClick={handleResetDb} />
      </form>
      <Separator size="4" my="4" />
      <SectionLink />
    </ThemeWithContainer>
  );
};

export default Popup;

type Props = {
  children: ReactNode;
};

const ThemeWithContainer: FC<Props> = ({ children }) => (
  <Theme radius="medium">
    <Container id="popup" display="block" width="max-content" height="max-content" p="4">
      {children}
    </Container>
  </Theme>
);

const ReturnText: FC<Props> = ({ children }) => (
  <ThemeWithContainer>
    <Text as="div">{children}</Text>
  </ThemeWithContainer>
);
