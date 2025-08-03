import { Report, ReportFormat, ReportState, SchedulingFrequency } from '../../types';

import { getMissingFields } from './validation';

const testReport: Report = {
  id: 0,
  name: 'Test report',
  recipients: 'test@example.com',
  replyTo: '',
  message: 'Hi, \nPlease find attached a PDF status report. If you have any questions, feel free to contact me!\nBest,',
  dashboardName: '',
  dashboards: [
    {
      dashboard: {
        uid: '7MeksYbmk',
        name: 'gdev dashboards/Alerting with TestData',
      },
      timeRange: {
        from: '',
        to: '',
      },
      reportVariables: {
        namefilter: ['TestData'],
      },
    },
  ],
  schedule: {
    frequency: SchedulingFrequency.Never,
    timeZone: 'Europe/Helsinki',
  },
  state: ReportState.Scheduled,
  formats: [ReportFormat.PDF],
  options: {
    orientation: 'landscape',
    layout: 'grid',
    timeRange: {
      from: '',
      to: '',
    },
    pdfShowTemplateVariables: false,
  },
  enableDashboardUrl: true,
};

describe('Report validation', () => {
  it('should correctly show that report is valid', () => {
    expect(getMissingFields(testReport)).toBe(false);
  });

  it('should validate missing report name', () => {
    expect(getMissingFields({ ...testReport, name: '' })).toBe(true);
  });

  it('should validate missing report recipients', () => {
    expect(getMissingFields({ ...testReport, recipients: '' })).toBe(true);
  });

  it('should validate missing report dashboard', () => {
    expect(
      getMissingFields({
        ...testReport,
        dashboards: [
          {
            dashboard: undefined,
            timeRange: {
              from: '',
              to: '',
            },
          },
        ],
      })
    ).toBe(true);
  });

  it('should validate empty report formats', () => {
    expect(
      getMissingFields({
        ...testReport,
        formats: [],
      })
    ).toBe(true);
  });
});
