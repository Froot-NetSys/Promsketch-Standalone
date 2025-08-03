import { NavModelItem } from '@grafana/data';

import { Report } from '../../types';

export const getPageNavInformation = ({ report, editMode }: { report: Report; editMode?: boolean }): NavModelItem => {
  const { name, dashboardName = '' } = report;
  const isNewReport = !Boolean(report.id) && !editMode;
  // dashboardname is a  placeholder text used when the report is saved as draft without adding a report name
  const reportTitle = name || dashboardName;

  return {
    text: isNewReport ? 'New report' : reportTitle,
  };
};
