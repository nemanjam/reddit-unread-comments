import { SettingsData } from '../schema';

export const defaultValues: SettingsData = {
  isHighlightOnTime: false,
  timeSlider: 0,
  timeScale: '6h',
  unHighlightOn: 'on-scroll',
  scrollTo: 'both',
  sortAllByNew: false,
  resetDb: '',
} as const;
