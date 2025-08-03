import {
  IntervalFrequency,
  LAST_DAY_OF_MONTH,
  SchedulingData,
  SchedulingFrequency,
  SchedulingOptions,
} from '../../types';

import { getSchedule, schedulePreview } from './scheduler';

describe('schedulePreview', () => {
  test('never', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Never,
      timeZone: 'UTC',
      sendTime: '',
    };
    const result = schedulePreview(schedule);

    expect(result).toBe('The report will not be sent.');
  });

  test('no start date', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Daily,
      timeZone: 'UTC',
      sendTime: 'now',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent immediately after it is saved and will be sent every day.');
  });

  test('no start date with workdays only', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Daily,
      timeZone: 'UTC',
      sendTime: 'now',
      workdaysOnly: true,
    };

    const result = schedulePreview(schedule);

    expect(result).toBe(
      'The report will be sent immediately after it is saved and will be sent every day, Monday to Friday.'
    );
  });

  test('custom with start date', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Custom,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      intervalFrequency: IntervalFrequency.Days,
      intervalAmount: '3',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every 3 days, from April 1, 2023.');
  });

  test('hourly with start date and end time', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Hourly,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      endDate: '2023-05-02',
      time: { hour: 2, minute: 0 },
      endTime: { hour: 22, minute: 0 },
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Hourly at minute 00, April 1, 2023 - May 2, 2023.');
  });

  test('hourly with start date and end time on the same day', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Hourly,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      endDate: '2023-04-01',
      time: { hour: 2, minute: 0 },
      endTime: { hour: 22, minute: 0 },
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Hourly at minute 00, April 1, 2023.');
  });

  test('once, send later', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Once,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Once on April 1, 2023.');
  });

  test('once, send now', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Once,
      timeZone: 'UTC',
      sendTime: 'now',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent immediately after it is saved.');
  });

  test('weekly', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Weekly,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every Saturday at 00:00 UTC+00:00.');
  });

  test('invalid frequency', () => {
    const schedule: SchedulingData = {
      frequency: 'invalid' as SchedulingFrequency,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
    };

    const result = schedulePreview(schedule);
    expect(result).toBe('');
  });

  test('monthly on the last day of month', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Monthly,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      dayOfMonth: LAST_DAY_OF_MONTH,
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Monthly on the last day at 00:00 UTC+00:00.');
  });

  test('custom with start date and without the end date', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Custom,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      intervalFrequency: IntervalFrequency.Weeks,
      intervalAmount: '2',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every 2 weeks, from April 1, 2023.');
  });

  test('custom with start and end date', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Custom,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      intervalFrequency: IntervalFrequency.Months,
      intervalAmount: '1',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every 1 months, April 1, 2023 - April 30, 2023.');
  });

  test('daily with start and end date', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Daily,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      endDate: '2023-04-30',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Daily at 00:00 UTC+00:00, April 1, 2023 - April 30, 2023.');
  });

  test('daily, workdays only', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Daily,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      workdaysOnly: true,
    };

    const result = schedulePreview(schedule);

    expect(result).toBe(
      'The report will be sent: Daily at 00:00 UTC+00:00, April 1, 2023 - April 30, 2023, Monday to Friday.'
    );
  });

  test('weekly with start and end date', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Weekly,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      endDate: '2023-04-30',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every Saturday at 00:00 UTC+00:00, April 1, 2023 - April 30, 2023.');
  });

  test('monthly with start and end date', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Monthly,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      endDate: '2023-06-30',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Monthly on the 1st day at 00:00 UTC+00:00, April 1, 2023 - June 30, 2023.');
  });

  test('custom with hours interval and workdays only', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Custom,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      intervalFrequency: IntervalFrequency.Hours,
      intervalAmount: '6',
      workdaysOnly: true,
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every 6 hours, from 00:00 UTC+00:00, Monday to Friday.');
  });

  test('custom with days interval', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Custom,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      intervalFrequency: IntervalFrequency.Days,
      intervalAmount: '10',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every 10 days, from April 1, 2023.');
  });

  test('custom with weeks interval', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Custom,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      intervalFrequency: IntervalFrequency.Weeks,
      intervalAmount: '3',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every 3 weeks, from April 1, 2023.');
  });

  test('custom with months interval', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Custom,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2023-04-01',
      intervalFrequency: IntervalFrequency.Months,
      intervalAmount: '4',
    };

    const result = schedulePreview(schedule);

    expect(result).toBe('The report will be sent: Every 4 months, from April 1, 2023.');
  });
});

describe('getSchedule', () => {
  test('monthly on the last day of month', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Monthly,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2024-03-31',
      dayOfMonth: LAST_DAY_OF_MONTH,
    };

    const result = getSchedule(schedule);

    const expectedResult: SchedulingOptions = {
      frequency: schedule.frequency,
      timeZone: schedule.timeZone,
      startDate: '2024-03-31T00:00:00+00:00',
      dayOfMonth: LAST_DAY_OF_MONTH,
    };

    expect(result).toStrictEqual(expectedResult);
  });
  test('monthly on the X day of month, except of last day', () => {
    const schedule: SchedulingData = {
      frequency: SchedulingFrequency.Monthly,
      timeZone: 'UTC',
      sendTime: 'later',
      startDate: '2024-03-20',
      dayOfMonth: '20',
    };

    const result = getSchedule(schedule);

    const expectedResult: SchedulingOptions = {
      frequency: schedule.frequency,
      timeZone: schedule.timeZone,
      startDate: '2024-03-20T00:00:00+00:00',
    };

    expect(result).toStrictEqual(expectedResult);
  });
});
