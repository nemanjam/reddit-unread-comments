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

export type TimeScaleType =
  | '1h'
  | '6h'
  | '1 day'
  | '1 week'
  | '1 month'
  | '1 year'
  | '10 years';

export type UnHighlightOnType = 'on-scroll' | 'on-url-change';
export type ScrollToType = 'unread' | 'by-date' | 'both';
export type ResetDbType = '' | 'thread' | 'all-threads' | 'user-settings';

export interface SettingsFormData {
  isHighlightOnTime: boolean;
  timeSlider: number;
  timeScale: TimeScaleType;
  unHighlightOn: UnHighlightOnType;
  scrollTo: ScrollToType;
  sortAllByNew: boolean;
  resetDb: ResetDbType;
}

export const defaultValues = {
  isHighlightOnTime: false,
  timeSlider: 0,
  timeScale: '6h',
  unHighlightOn: 'on-scroll',
  scrollTo: 'both',
  sortAllByNew: false,
  resetDb: '',
} as const;

const Popup: FC = () => {
  const form = useForm<SettingsFormData>({
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
