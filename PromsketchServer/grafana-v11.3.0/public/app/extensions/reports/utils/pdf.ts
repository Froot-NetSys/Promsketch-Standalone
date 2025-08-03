import { urlUtil } from '@grafana/data';

import { ReportDashboard, ReportLayout, ReportOrientation } from '../../types';
import { getRootPath } from '../../utils/url';

import { getTimeRangeFromURL } from './url';

export const buildPdfLink = (
  orientation: ReportOrientation,
  layout: ReportLayout,
  scaleFactor: number,
  dashboardUid: string,
  variables: Record<string, string[]>
) => {
  let pdfUrl = `${getRootPath()}/api/reports/render/pdfs`;
  const params: Record<string, string | number> = { orientation, layout, scaleFactor };

  const reportDashboard: {
    dashboard: Partial<ReportDashboard['dashboard']>;
    timeRange?: ReportDashboard['timeRange'];
    reportVariables?: ReportDashboard['reportVariables'];
  } = {
    dashboard: {
      uid: dashboardUid,
    },
  };
  if (Object.keys(variables).length !== 0) {
    reportDashboard.reportVariables = variables;
  }

  const timeRange = getTimeRangeFromURL();

  if (timeRange) {
    reportDashboard.timeRange = timeRange;
  }

  params.dashboards = JSON.stringify([reportDashboard]);
  pdfUrl = urlUtil.appendQueryToUrl(pdfUrl, urlUtil.toUrlParams(params));

  return pdfUrl;
};
