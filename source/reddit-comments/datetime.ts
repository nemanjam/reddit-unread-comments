import { sub, format } from 'date-fns';
import { dateCorrectionOffset } from './constants/config';
import { SettingsData, TimeScaleType } from './database/schema';

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

  // fixes flickering for 1hr > 1hr
  // sub = older, add = newer
  const correctedPastDate = sub(pastDate, { seconds: dateCorrectionOffset });

  return correctedPastDate;
};
