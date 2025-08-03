import { toUtc, RawTimeRange, dateMath } from '@grafana/data';

import { defaultTimeRange } from '../reports/state/reducers';
import { ReportTimeRange } from '../types';

const isValidTimeRange = (range: any) => {
  return dateMath.isValid(range.from) && dateMath.isValid(range.to);
};

/**
 * Get a string representation of range timestamp to be sent to backend
 * @param timeRange
 */
export const parseRange = (timeRange?: RawTimeRange): ReportTimeRange => {
  if (!timeRange || !isValidTimeRange(timeRange)) {
    return { from: '', to: '' };
  }

  return {
    to: timeRange.to.valueOf().toString(),
    from: timeRange.from.valueOf().toString(),
  };
};

/**
 * Return relative time e.g. 'now', 'now-6h' or a parsed timestamp
 * @param timeRange
 */
export const getRange = (timeRange: any): ReportTimeRange => {
  const from = parseValue(timeRange.from);
  const to = parseValue(timeRange.to);

  if (!isValidTimeRange({ from, to })) {
    return defaultTimeRange;
  }
  return { from, to, raw: { from, to } };
};

const parseValue = (value: any) => {
  const parsed = parseInt(value, 10);
  if (!isNaN(parsed)) {
    return toUtc(parsed);
  }

  return value;
};
