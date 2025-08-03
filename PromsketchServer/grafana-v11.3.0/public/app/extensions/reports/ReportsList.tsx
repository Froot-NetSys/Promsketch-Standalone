import { css, cx } from '@emotion/css';
import { FC } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, CardContainer, ConfirmButton, Tooltip, useStyles2, useTheme2 } from '@grafana/ui';
import { contextSrv } from 'app/core/core';

import { AccessControlAction, Report, ReportState } from '../types';

import { getButtonText } from './utils/pageActions';
import { getReportStateInfo, getToggledReportState } from './utils/reportState';
import { parseScheduleTime } from './utils/scheduler';
import { getMissingFields } from './utils/validation';

interface Props {
  reports: Report[];
  deleteReport: (report: Report) => void;
  updateReport: (report: Report, refetch?: boolean) => void;
  filter: string;
}

const filterReports = (reports: Report[], filter: string) => {
  const filterFields: Array<keyof Pick<Report, 'name' | 'dashboardName' | 'recipients'>> = ['name', 'recipients'];

  const dbFilter = (report: Report) =>
    report.dashboards.some(({ dashboard }) => dashboard?.name.toLowerCase().includes(filter.toLowerCase()));

  return reports.filter((report) => {
    return (
      filterFields.some((field) => report[field]?.toLowerCase().includes(filter.toLowerCase())) || dbFilter(report)
    );
  });
};

const getReportStateColors = (theme: GrafanaTheme2) => {
  return new Map([
    [ReportState.Scheduled, theme.colors.success.text],
    [ReportState.Expired, theme.colors.warning.text],
    [ReportState.Draft, theme.colors.text.primary],
    [ReportState.Never, theme.colors.text.primary],
    [ReportState.Paused, theme.colors.text.disabled],
  ]);
};

export const ReportList: FC<Props> = ({ deleteReport, updateReport, reports, filter }) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  const toggleReportState = (report: Report) => {
    const newState = getToggledReportState(report.state);

    updateReport(
      {
        ...report,
        state: newState,
      },
      true
    );
  };

  const canEditReport = contextSrv.hasPermission(AccessControlAction.ReportingWrite);
  const canDeleteReport = contextSrv.hasPermission(AccessControlAction.ReportingDelete);

  return (
    <div>
      {filterReports(reports, filter).map((report) => {
        const splitRecipients = report.recipients.split(';');
        const numRecipients = splitRecipients.length;
        const scheduleTime = parseScheduleTime(report.schedule);
        const { isNever, showPlay, disableEdit, reportState } = getReportStateInfo(report);
        const color = getReportStateColors(theme).get(report.state);
        return (
          <CardContainer key={report.id} href={`reports/confirm/${report.id}`} className={styles.container}>
            <div className={styles.info}>
              <span className={styles.title}>{report.name}</span>
              <span className={styles.dashboards}>
                {[...new Set(report.dashboards.map(({ dashboard }) => dashboard?.name))].join(', ')}
              </span>
            </div>
            <div className={styles.recipients}>
              <Tooltip content={splitRecipients.join(', ')} placement={'top'}>
                <div>{`${numRecipients} recipient${numRecipients > 1 ? 's' : ''}`}</div>
              </Tooltip>
            </div>
            <div className={styles.schedule}>
              <span
                className={cx(
                  styles.scheduleStatus,
                  css`
                    color: ${color};
                  `
                )}
              >
                {reportState.toUpperCase()}
              </span>
              {!isNever && <span className={styles.text}>{scheduleTime}</span>}
            </div>
            <div className={styles.buttonWrapper}>
              <Tooltip
                content={`${
                  showPlay ? (reportState === ReportState.Draft ? getButtonText(report.schedule) : 'Resume') : 'Pause'
                } report`}
                placement={'top'}
              >
                <Button
                  type={'button'}
                  variant={'secondary'}
                  fill={'text'}
                  icon={showPlay ? 'play' : 'pause'}
                  size={'md'}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleReportState(report);
                  }}
                  disabled={disableEdit || !canEditReport || getMissingFields(report)}
                />
              </Tooltip>
              <ConfirmButton
                confirmText="Delete"
                confirmVariant="destructive"
                size={'md'}
                disabled={!canDeleteReport}
                onConfirm={() => deleteReport(report)}
              >
                <Button
                  type="button"
                  className={styles.deleteButton}
                  aria-label={`Delete report ${report.name}`}
                  variant="secondary"
                  icon="trash-alt"
                  size={'md'}
                  fill={'text'}
                />
              </ConfirmButton>
            </div>
          </CardContainer>
        );
      })}
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
    & > a {
        align-items: center;
      },
    `,
    info: css`
      display: flex;
      flex-direction: column;
      width: 30%;
    `,
    title: css`
      font-size: ${theme.typography.h5.fontSize};
      font-weight: ${theme.typography.fontWeightBold};
    `,
    dashboards: css`
      font-size: ${theme.typography.bodySmall.fontSize};
      color: ${theme.colors.text.secondary};
    `,
    recipients: css`
      display: flex;
      width: 25%;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      },
    `,
    schedule: css`
      display: flex;
      flex-direction: column;
      width: 40%;
    `,
    scheduleStatus: css`
      text-transform: uppercase;
    `,
    buttonWrapper: css`
      display: flex;
      align-items: center;
      width: 5%;
      & > button {
        &[disabled] {
          pointer-events: all;
        },
      },
    `,
    deleteButton: css`
      &:hover {
        color: ${theme.colors.error.text};
    `,
    text: css`
      color: ${theme.colors.text.secondary};
    `,
  };
};
