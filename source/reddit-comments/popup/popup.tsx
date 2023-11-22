import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Theme, Container, Separator } from '@radix-ui/themes';

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
  | '5 years';

export interface SettingsFormData {
  isHighlightOnTime: boolean;
  timeSlider: number;
  timeScale: TimeScaleType;
}

const defaultValues = {
  isHighlightOnTime: false,
  timeSlider: 0,
  timeScale: '6h' as const,
};

const Popup: FC = () => {
  const methods = useForm<SettingsFormData>({
    mode: 'onChange',
    defaultValues,
  });
  const { register, formState, handleSubmit, getValues } = methods;

  console.error('getValues', getValues());

  return (
    <Theme radius="medium">
      <Container id="popup" p="4">
        <form>
          <SectionTime register={register} />
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
