import { sub, format } from 'date-fns';
import { dateCorrectionOffset } from './constants';

import { SettingsData, TimeScaleType } from './database/schema';
import { MyUnparsableDateException } from './exceptions';

type TimeUnit =
  | 'now'
  | 'sec.'
  | 'min.'
  | 'hr.'
  | 'day'
  | 'days'
  | 'week'
  | 'weeks'
  | 'mo.'
  | 'month'
  | 'months'
  | 'year'
  | 'years';

export const relativeTimeStringToDate = (relativeTime: string): Date => {
  const [value, unit] = relativeTime.split(' ');
  let date: Date;

  switch (unit as TimeUnit) {
    // 'just now'
    case 'now':
      date = sub(new Date(), { seconds: 1 });
      break;
    case 'sec.':
      date = sub(new Date(), { seconds: parseInt(value, 10) });
      break;
    case 'min.':
      date = sub(new Date(), { minutes: parseInt(value, 10) });
      break;
    case 'hr.':
      date = sub(new Date(), { hours: parseInt(value, 10) });
      break;
    case 'day':
    case 'days':
      date = sub(new Date(), { days: parseInt(value, 10) });
      break;
    case 'week':
    case 'weeks':
      date = sub(new Date(), { weeks: parseInt(value, 10) });
      break;
    case 'mo.':
    case 'month':
    case 'months':
      date = sub(new Date(), { months: parseInt(value, 10) });
      break;
    case 'year':
    case 'years':
      date = sub(new Date(), { years: parseInt(value, 10) });
      break;
    default:
      throw new MyUnparsableDateException(
        `Invalid unit: ${unit} in relative time string`
      );
  }

  return date;
};

/** for testing */
export const getDateHoursAgo = (hours: number) => sub(new Date(), { hours });

export type SettingsDataHighlight = Pick<SettingsData, 'timeScale' | 'timeSlider'>;

export const formatDateEU = (date: Date): string =>
  format(date, 'HH:mm:ss d, MMMM, yyyy.');

export const formatDateForLogger = (date: Date): string =>
  format(date, 'dd-MM-yyyy HH:mm:ss.SSS xxx');

export interface SliderProps {
  max: number;
  step: number;
  unit: string;
}

export const getSliderPropsFromScale = (timeScale: TimeScaleType): SliderProps => {
  const sliderPropsMap = {
    '1h': { max: 60, step: 1, unit: 'minutes' },
    '6h': { max: 6, step: 1, unit: 'hours' },
    '1 day': { max: 24, step: 1, unit: 'hours' },
    '1 week': { max: 7, step: 1, unit: 'days' },
    '1 month': { max: 31, step: 1, unit: 'days' },
    '1 year': { max: 12, step: 1, unit: 'months' },
    '10 years': { max: 10, step: 1, unit: 'years' },
  } as const;

  return sliderPropsMap[timeScale];
};

export const radioAndSliderToDate = (
  settingsDataHighlight: SettingsDataHighlight
): Date => {
  const { timeScale, timeSlider } = settingsDataHighlight;
  const { unit } = getSliderPropsFromScale(timeScale);

  const pastDate = sub(new Date(), { [unit]: timeSlider });

  // make the slider 30 seconds older than it is so the comment passes the filtering condition
  // fixes flickering for 1hr > 1hr
  // should be done exactly and only here
  // sub = older, add = newer
  const correctedPastDate = sub(pastDate, { seconds: dateCorrectionOffset });

  return correctedPastDate;
};
