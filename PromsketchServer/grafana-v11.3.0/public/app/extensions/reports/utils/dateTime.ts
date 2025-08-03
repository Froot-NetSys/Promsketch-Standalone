import { dateTime, dateTimeFormat, RawTimeRange } from '@grafana/data';
import { describeTimeRange } from '@grafana/data/src/datetime/rangeutil';
import { TimeZone } from '@grafana/schema';

import { ReportTime, ReportTimeRange } from '../../types';

/**
 * Combine date, time and timezone into a single DateTime string and set the timezone to UTC
 * @param date
 * @param time
 * @param timeZone
 */
export const createDate = (date: Date | string, time: ReportTime = { hour: 0, minute: 0 }, timeZone?: string) => {
  const timeString = `${time.hour}:${time.minute}:00`;
  const formattedDate = typeof date === 'string' ? getDate(date) : date;
  const dateObj = new Date(`${dateTime(formattedDate).format('YYYY/MM/DD')} ${timeString}`);
  const offset = dateTimeFormat(dateObj.getTime(), {
    timeZone,
    format: 'Z',
  });

  return removeTimeZone(dateTime(dateObj).format()) + offset;
};

const removeTimeZone = (date: string) => {
  if (date.includes('Z')) {
    return date.replace('Z', '');
  }

  return date.slice(0, -6);
};

/**
 * Extract date part from datetime string
 * @param date
 */
export const getDate = (date?: string) => {
  if (!date) {
    return '';
  }
  return dateTime(date.split('T')[0]).toDate();
};

/**
 * Pad time with 0, if it has one digit
 */
export const padTime = (time: number | string) => {
  if (String(time).length === 1) {
    return `0${time}`;
  }

  return String(time);
};

/**
 * Extract time as {hour, minute} from datetime string
 * @param date
 */
export const getTime = (date?: string) => {
  if (!date) {
    return { hour: 0, minute: 0 };
  }
  const match = date.match(/T(\d+):(\d+)/);
  if (match) {
    const [, hour, minute] = match;
    return { hour: parseInt(hour, 10), minute: parseInt(minute, 10) };
  }

  return { hour: 0, minute: 0 };
};

/**
 * Check if date is in the past
 * @param date
 */
export const isPast = (date?: string) => {
  if (!date) {
    return false;
  }

  return dateTime(date).isBefore(dateTime());
};

export const getFormatted = (date?: string, timeZone?: TimeZone) => {
  if (!date) {
    return { time: undefined, date: undefined };
  }
  const { hour, minute } = getTime(date);
  return {
    date: dateTimeFormat(date, { format: 'MMMM DD, YYYY', timeZone: timeZone ?? '' }),
    time: `${padTime(hour)}:${padTime(minute)}`,
  };
};

export const getTimeRangeDisplay = (timeRange: ReportTimeRange) => {
  if (!timeRange.from || !timeRange.to) {
    return 'Dashboard time range';
  }
  const from = parseInt(timeRange.from, 10);
  const to = parseInt(timeRange.to, 10);

  if (!isNaN(from) && !isNaN(to)) {
    return describeTimeRange({ from: dateTime(from), to: dateTime(to) });
  }

  return describeTimeRange(timeRange);
};

export const isEmptyTimeRange = (timeRange?: RawTimeRange) => {
  return !timeRange || !timeRange.from || !timeRange.to;
};

// we need to warn the user if he wrongly selected these days as last day of month
export const canBeLastDayOfMonth = (day: number) => {
  return [29, 30, 31].includes(day);
};
