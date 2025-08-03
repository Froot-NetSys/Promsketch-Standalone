import { ReportDashboard } from '../../types';

export const dashboardsInvalid = (dashboards?: ReportDashboard[]) => {
  if (!dashboards?.length) {
    return true;
  }

  return !dashboards.some((db) => !!db.dashboard?.uid);
};
