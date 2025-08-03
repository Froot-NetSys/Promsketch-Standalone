import { Report, ReportState, SchedulingFrequency } from '../../types';

export const getReportStateInfo = (report: Report) => {
  const reportState = report.state;
  const isNever = report.schedule.frequency === SchedulingFrequency.Never;
  const showPlay = isNever || [ReportState.Draft, ReportState.Expired, ReportState.Paused].includes(reportState);
  const disableEdit = isNever || [ReportState.Expired].includes(reportState);

  return { isNever, showPlay, disableEdit, reportState };
};

export const getToggledReportState = (reportState: ReportState) => {
  let newState = ReportState.Scheduled;

  if (reportState === ReportState.Expired) {
    newState = reportState;
  } else if (reportState !== ReportState.Paused) {
    newState = ReportState.Paused;
  }

  return newState;
};
