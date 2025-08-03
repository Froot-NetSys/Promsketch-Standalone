import { urlUtil } from '@grafana/data';
import { getTimeSrv } from 'app/features/dashboard/services/TimeSrv';
import { DashboardModel } from 'app/features/dashboard/state';
import { DashboardScene } from 'app/features/dashboard-scene/scene/DashboardScene';
import { getVariablesUrlParams } from 'app/features/variables/getAllVariableValuesForUrl';

import { Report, ReportDashboard, StepKey } from '../../types';
import { getRange } from "../../utils/time";
import { BASE_URL } from '../constants';
import { defaultTimeRange, initialState } from '../state/reducers';

import { collectVariables } from './variables';

export const getUrlValues = () => {
  if (!window.location.search) {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  return {
    timeRange: {
      to: urlParams.get('to') || '',
      from: urlParams.get('from') || '',
    },
    dashboard: {
      uid: urlParams.get('db-uid') || '',
      name: urlParams.get('db-name') || '',
    },
    variables: collectVariables(),
  };
};

/**
 * Apply values from URL params as form's default, in case a report is created
 * from dashboard
 * @param report
 */
export const applyUrlValues = (report: Report) => {
  // Do not apply URL values for edited report
  if (report.id) {
    return report;
  }
  const values = getUrlValues();
  if (!values) {
    return report;
  }

  const { timeRange, dashboard, variables } = values;
  let dashboards = [...initialState.report.dashboards];

  if (timeRange?.from && timeRange?.to) {
    dashboards[0] = { ...dashboards[0], timeRange: { ...timeRange, raw: timeRange } };
  }

  if (dashboard.name && dashboard.uid) {
    dashboards[0] = {
      ...dashboards[0],
      dashboard: { uid: dashboard.uid, name: dashboard.name },
    };
  }

  if (variables && Object.keys(variables).length) {
    dashboards[0] = { ...dashboards[0], reportVariables: variables };
  }

  return { ...report, dashboards };
};

export const getTimeRangeFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const to = urlParams.get('to');
  const from = urlParams.get('from');
  if (from && to) {
    return { from, to };
  }
  return null;
};

export const getSectionUrl = (section: StepKey, id?: string | number) => {
  return `${BASE_URL}/${section}${id ? '/' + id : ''}`;
};

export const getStepUrl = (id?: string | number) => (step: StepKey) => {
  return `${BASE_URL}/${step}${id ? '/' + id : ''}`;
};

export const getNewReportUrl = (dashboard: DashboardModel | DashboardScene) => {
  const variablesQuery = urlUtil.toUrlParams(getVariablesUrlParams());
  const timeRangeUrl = urlUtil.toUrlParams(getTimeSrv().timeRangeForUrl());

  const uid = dashboard instanceof DashboardScene ? dashboard?.state.uid : dashboard?.uid;
  const title = dashboard instanceof DashboardScene ? dashboard?.state.title : dashboard?.title;

  return `reports/new/?${variablesQuery}&${timeRangeUrl}&db-uid=${uid}&db-name=${title}`;
};

export const getReportDashboardsAsUrlParam = (reportDashboards: ReportDashboard[]) => {
  return JSON.stringify(
      reportDashboards.map((db) => {
        const { from, to } = getRange(db.timeRange).raw || defaultTimeRange.raw;
        return {
          dashboard: { uid: db.dashboard?.uid },
          timeRange: { from: from.valueOf().toString(), to: to.valueOf().toString() },
          reportVariables: db.reportVariables,
        };
      })
  );
}
