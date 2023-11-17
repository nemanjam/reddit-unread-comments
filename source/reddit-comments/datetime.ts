import { add } from 'date-fns';
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
      date = add(new Date(), { seconds: 1 });
      break;
    case 'sec.':
      date = add(new Date(), { seconds: -parseInt(value, 10) });
      break;
    case 'min.':
      date = add(new Date(), { minutes: -parseInt(value, 10) });
      break;
    case 'hr.':
      date = add(new Date(), { hours: -parseInt(value, 10) });
      break;
    case 'day':
    case 'days':
      date = add(new Date(), { days: -parseInt(value, 10) });
      break;
    case 'week':
    case 'weeks':
      date = add(new Date(), { weeks: -parseInt(value, 10) });
      break;
    case 'mo.':
    case 'month':
    case 'months':
      date = add(new Date(), { months: -parseInt(value, 10) });
      break;
    case 'year':
    case 'years':
      date = add(new Date(), { years: -parseInt(value, 10) });
      break;
    default:
      throw new MyUnparsableDateException(
        `Invalid unit: ${unit} in relative time string`
      );
  }

  return date;
};
