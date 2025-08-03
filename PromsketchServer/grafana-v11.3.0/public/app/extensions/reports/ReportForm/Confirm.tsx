import { css, cx } from '@emotion/css';
import { capitalize } from 'lodash';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { useNavigate } from 'react-router-dom-v5-compat';

import { GrafanaTheme2 } from '@grafana/data';
import { reportInteraction } from '@grafana/runtime';
import { FieldSet, Icon, LinkButton, useStyles2 } from '@grafana/ui';
import { formatUtcOffset } from '@grafana/ui/src/components/DateTimePickers/TimeZonePicker/TimeZoneOffset';

import {
  EnterpriseStoreState,
  ReportDashboard,
  ReportDataToRender,
  ReportFormat,
  ReportState,
  SchedulingData,
  SchedulingFrequency,
  StepKey,
} from '../../types';
import { BASE_URL, defaultScaleFactor, reportScales } from '../constants';
import { createReport, updateReport } from '../state/actions';
import { clearReportState, initialState } from '../state/reducers';
import { getFormatted, getTimeRangeDisplay } from '../utils/dateTime';
import { getFormatsDisplay } from '../utils/formats';
import { schedulePreview, showWorkdaysOnly } from '../utils/scheduler';
import { getSectionUrl } from '../utils/url';
import { getMissingFields } from '../utils/validation';

import { DashboardLink } from './DashboardLink';
import ReportForm from './ReportForm';

const mapStateToProps = (state: EnterpriseStoreState) => {
  const { report, isUpdated } = state.reports;
  return {
    report,
    isUpdated,
  };
};

const mapActionsToProps = {
  createReport,
  updateReport,
  clearReportState,
};

const connector = connect(mapStateToProps, mapActionsToProps);
export type Props = ConnectedProps<typeof connector> & { reportId?: string };

export const Confirm = ({ report, createReport, updateReport, clearReportState, isUpdated, reportId }: Props) => {
  const { formats, options, schedule, dashboards } = report;
  const {
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = useForm();
  const navigate = useNavigate();

  const styles = useStyles2(getStyles);
  const editMode = !!reportId && !isUpdated;
  const disableSubmit = getMissingFields(report);

  const { time: startTime, date: startDate } = getFormatted(schedule.startDate, schedule.timeZone);
  const { time: endTime, date: endDate } = getFormatted(schedule.endDate, schedule.timeZone);

  useEffect(() => {
    if (isSubmitSuccessful) {
      navigate(BASE_URL);
    }
  }, [isSubmitSuccessful, navigate]);

  const submitReport = async () => {
    const createOrUpdate = !!report.id ? updateReport : createReport;
    if (report.state === ReportState.Draft) {
      const newState =
        report.schedule.frequency === SchedulingFrequency.Never ? ReportState.Never : ReportState.Scheduled;
      report = { ...report, state: newState };
    }
    await createOrUpdate(report);
    reportInteraction('reports_report_submitted', {
      replyToPopulated: !!report.replyTo,
      includesDashboardLink: report.enableDashboardUrl,
      numberOfDashboardsSelected: report.dashboards.length,
      templateVariablesSelected: report.dashboards.some((db) => !!db.reportVariables),
      orientation: report.options.orientation,
      layout: report.options.layout,
      frequency: report.schedule.frequency,
      sendTime: report.schedule.startDate ? 'later' : 'now',
      endDate: !!report.schedule.endDate,
    });
    clearReportState();
  };

  const { orientation: defaultOrientation, layout: defaultLayout } = initialState.report.options;
  const reportData: ReportDataToRender = [
    {
      title: 'Select dashboard',
      id: StepKey.SelectDashboard,
      items: (dashboards || []).flatMap((field, index, arr) => {
        return [
          {
            title: `Source dashboard${index === 0 ? '*' : ''}`, // Only the first db is required
            value: field.dashboard?.uid ? (
              <DashboardLink name={field.dashboard.name} uid={field.dashboard?.uid} className={styles.dashboardLink} />
            ) : (
              ''
            ),
            id: 'name',
            required: true,
          },
          {
            title: 'Template variables',
            value: <VariablesPreview variables={field.reportVariables} className={styles.title} />,
          },
          { title: 'Time range', value: getTimeRangeDisplay(field.timeRange) },
          // Add empty row for spacing in case of multiple dashboards
          ...(arr.length > 1 && index !== arr.length - 1 ? [{ title: '', value: '' }] : []),
        ];
      }),
    },
    {
      title: 'Format report',
      id: StepKey.FormatReport,
      items: [
        { title: 'Preferred format*', value: getFormatsDisplay(formats), id: 'formats', required: true },
        ...(formats.includes(ReportFormat.PDF)
          ? [
              { title: 'PDF orientation', value: capitalize(options.orientation || defaultOrientation) },
              { title: 'PDF layout', value: capitalize(options.layout || defaultLayout) },
              { title: 'Scale factor', value: reportScales()[report.scaleFactor || defaultScaleFactor].label },
              { title: 'PDF show template variables', value: options.pdfShowTemplateVariables ? 'Yes' : 'No'},
            ]
          : []),
      ],
    },
    {
      title: 'Schedule',
      id: StepKey.Schedule,
      items: [
        { title: 'Recurrence', value: capitalize(schedule.frequency) },
        ...(schedule.frequency === SchedulingFrequency.Custom
          ? [{ title: 'Repeat every', value: `${schedule.intervalAmount} ${schedule.intervalFrequency}` }]
          : []),
        ...(schedule.frequency !== SchedulingFrequency.Never
          ? [
              { title: 'Start date', value: startDate || 'Now' },
              { title: 'Start time', value: startTime || 'Now' },
              { title: 'End date', value: endDate },
              { title: 'End time', value: endTime },
              {
                title: 'Time zone',
                value: schedule.timeZone ? formatUtcOffset(Date.now(), schedule.timeZone) : '',
              },
            ]
          : []),
        ...(showWorkdaysOnly(schedule.frequency, schedule.intervalFrequency)
          ? [
              {
                title: 'Send Monday to Friday only',
                value: schedule.workdaysOnly ? (
                  <Icon name={'check'} size={'xl'} />
                ) : (
                  <Icon name={'minus'} size={'xl'} />
                ),
              },
            ]
          : []),
        { value: schedulePreview(report.schedule as SchedulingData), title: '' },
      ],
    },
    {
      title: 'Share',
      id: StepKey.Share,
      items: [
        // id key is required for fields that need validation
        { title: 'Report name*', value: report.name, id: 'name', required: true },
        { title: 'Recipients*', value: report.recipients, id: 'recipients', required: true },
        { title: 'Reply-to-email', value: report.replyTo || 'none' },
        { title: 'Message', value: report.message || 'none' },
        { title: 'Dashboard link', value: report.enableDashboardUrl ? 'Yes' : 'No'},
      ],
    },
  ];

  return (
    <ReportForm
      activeStep={StepKey.Confirm}
      confirmRedirect={!isSubmitSuccessful && isUpdated}
      disabled={disableSubmit}
      editMode={editMode}
      onSubmit={handleSubmit(submitReport)}
      reportId={reportId}
    >
      <FieldSet label={editMode ? '' : '5. Confirm'}>
        {reportData.map((section) => {
          const hasMissingFields = getMissingFields(report, section.id);
          return (
            <div className={styles.section} key={section.title}>
              <div className={styles.sectionHeader}>
                <h5 className={styles.sectionTitle}>{section.title}</h5>
                <LinkButton
                  variant={hasMissingFields ? 'primary' : 'secondary'}
                  fill={'text'}
                  href={getSectionUrl(section.id, reportId)}
                  size={'sm'}
                >
                  Edit
                </LinkButton>
              </div>
              {section.items
                // Undefined value means the item shouldn't be rendered
                .filter((item) => item.value !== undefined)
                .map((row, index) => {
                  const missingValue =
                    !!row.required && (!row.value || (Array.isArray(row.value) && !row.value.length));
                  return !!row.title ? (
                    <div className={styles.row} key={index}>
                      <div className={cx(styles.title, missingValue && styles.warning)}>{row.title}:</div>
                      <div className={cx(styles.value, row.value === 'none' && !missingValue ? styles.textMuted : '')}>
                        {missingValue ? <Icon name={'exclamation-triangle'} className={styles.warning} /> : row.value}
                      </div>
                    </div>
                  ) : (
                    <div className={cx(styles.row, styles.textMuted)} key={index}>
                      {row.value}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </FieldSet>
    </ReportForm>
  );
};

export default connector(Confirm);

const getStyles = (theme: GrafanaTheme2) => {
  return {
    section: css`
      width: 100%;
      padding: ${theme.spacing(3, 0)};
      margin-bottom: ${theme.spacing(3)};
    `,
    sectionHeader: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${theme.spacing(1)};
      border: 1px solid ${theme.colors.border.weak};
    `,
    sectionTitle: css`
      margin: 0;
    `,
    row: css`
      border: 1px solid ${theme.colors.border.weak};
      border-top: none;
      display: flex;
      width: 100%;
      padding: ${theme.spacing(1)};
    `,
    warning: css`
      color: ${theme.colors.warning.text};
    `,
    title: css`
      width: 30%;
      color: ${theme.colors.text.secondary};
    `,
    textMuted: css`
      color: ${theme.colors.text.secondary};
    `,
    value: css`
      width: 70%;
      word-break: break-word;
    `,
    dashboardLink: css`
      color: ${theme.colors.text.primary};
      font-size: ${theme.typography.body.fontSize};
      margin-top: 0;
    `,
  };
};

interface VariablesPreviewProps {
  className?: string;
  variables?: ReportDashboard['reportVariables'];
}

const VariablesPreview = ({ variables, className }: VariablesPreviewProps) => {
  const styles = useStyles2(getStyles);
  if (!variables || !Object.keys(variables).length) {
    return <span className={styles.textMuted}>none</span>;
  }

  return (
    <>
      {Object.entries(variables).map(([key, value]) => (
        <span key={key}>
          <span className={className}>{key}</span>: {value.join(', ')};{' '}
        </span>
      ))}
    </>
  );
};
