import { EnterpriseStoreState, Report, ReportsState } from '../../types';

export const getReport = (state: ReportsState, currentReportId: any): Report | null => {
  if (state.report.id === parseInt(currentReportId, 10)) {
    return state.report;
  }

  return null;
};

export const getLastUid = (state: EnterpriseStoreState): string | undefined => {
  return state.reports.lastUid;
};
