import { saveAs } from 'file-saver';
import { lastValueFrom } from "rxjs";

import { AppEvents, RawTimeRange, urlUtil } from '@grafana/data';
import { getAppEvents, getBackendSrv } from '@grafana/runtime';
import { getDashboardAPI } from 'app/features/dashboard/api/dashboard_api';
import { getTimeSrv } from 'app/features/dashboard/services/TimeSrv';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';
import { initVariablesTransaction } from 'app/features/variables/state/actions';
import { ThunkResult } from 'app/types';

import { Report, ReportDashboard, ReportDTO, SchedulingOptions } from '../../types';
import { dashboardsInvalid } from '../utils/dashboards';
import { isEmptyTimeRange } from '../utils/dateTime';
import { getReportDashboardsAsUrlParam } from "../utils/url";
import { applyDefaultVariables, refreshOnTimeRange, toReportVariables } from '../utils/variables';

import {
  downloadCSVBegin,
  downloadCSVEnd,
  reportLoaded,
  reportLoadingBegin,
  reportLoadingEnd,
  reportsLoaded,
  setLastUid,
  testEmailSendBegin,
  testEmailSendEnd,
} from './reducers';

const baseUrl = 'api/reports';

export function getReports(): ThunkResult<void> {
  return async (dispatch) => {
    const reports = await getBackendSrv().get(baseUrl);
    dispatch(reportsLoaded(reports));
  };
}

export function initVariables(
  dashboardUid: string,
  templateVars?: Report['templateVars'],
  timeRange?: RawTimeRange
): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    const resp = await getDashboardAPI().getDashboardDTO(dashboardUid);
    const dashboard = new DashboardModel(resp.dashboard, resp.meta);

    // create an array with all variables that are being used for repeating
    const variablesUsedInRepeatingPanelsSet = getVariablesUsedInRepeatingPanels(dashboard.panels);

    // Make sure that changing time range in report updates it for the variables using that time range
    if (refreshOnTimeRange(dashboard.templating.list)) {
      const time = !isEmptyTimeRange(timeRange) ? timeRange : dashboard?.time;
      getTimeSrv().setTime(time);
    }
    const list = applyDefaultVariables(
      dashboard.templating.list,
      templateVars || toReportVariables(dashboard.templating.list),
      variablesUsedInRepeatingPanelsSet
    );
    await dispatch(
      initVariablesTransaction(resp.dashboard.uid, { ...dashboard, templating: { list } } as DashboardModel)
    );
    dispatch(setLastUid(dashboardUid));
  };
}

// loop recursively all rows and panels looking for variables used as source for repeating panels
export function getVariablesUsedInRepeatingPanels(panels: PanelModel[], result: Set<string> = new Set()): Set<string> {
  panels.forEach((panel) => {
    if (panel.repeat) {
      result.add(panel.repeat);
    }

    if (panel.panels) {
      getVariablesUsedInRepeatingPanels(panel.panels, result);
    }
  });

  return result;
}

export function loadReport(id: number): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    dispatch(reportLoadingBegin());
    try {
      const report = await getBackendSrv().get(`${baseUrl}/${id}`);
      if (!report.dashboards) {
        report.dashboards = [
          {
            dashboard: {
              uid: report.dashboardUid,
              id: report.dashboardId,
              name: report.dashboardName,
            },
            reportVariables: report.templateVars,
            timeRange: report.options.timeRange,
          },
        ];
      }
      for (const db of report.dashboards) {
        if (db.dashboard.uid) {
          await dispatch(initVariables(db.dashboard.uid, db.reportVariables, db.timeRange));
        }
      }
      dispatch(reportLoaded(report));
    } catch (e) {
      dispatch(reportLoadingEnd());
    }
  };
}

export function sendTestEmail(report: ReportDTO): ThunkResult<void> {
  return (dispatch) => {
    dispatch(testEmailSendBegin());
    return getBackendSrv()
      .post(`${baseUrl}/test-email/`, report)
      .finally(() => dispatch(testEmailSendEnd()));
  };
}

export function deleteReport(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`${baseUrl}/${id}`);
    dispatch(getReports());
  };
}

export function createReport(report: ReportDTO): ThunkResult<void> {
  return async () => {
    try {
      await getBackendSrv().post(baseUrl, report);
    } catch (error) {
      throw error;
    }
  };
}

export function updateReport(report: ReportDTO, refetch?: boolean): ThunkResult<void> {
  return async (dispatch) => {
    const deprecatedFields = ['hour', 'minute', 'day'];
    report = {
      ...report,
      schedule: Object.fromEntries(
        Object.entries(report.schedule).filter(([key, _]: [string, any]) => !deprecatedFields.includes(key) as unknown)
      ) as SchedulingOptions,
    };
    await getBackendSrv().put(`${baseUrl}/${report.id}`, report);
    if (refetch) {
      dispatch(getReports());
    }
  };
}

export function downloadCSV(reportTitle: string, reportDashboards: ReportDashboard[]): ThunkResult<void> {
  return async (dispatch) => {
    if (dashboardsInvalid(reportDashboards)) {
      getAppEvents().publish({
        type: AppEvents.alertError.name,
        payload: ['Invalid dashboards'],
      });
      return;
    }

    const params: Record<string, string> = {
      title: reportTitle,
    };

    params.dashboards = getReportDashboardsAsUrlParam(reportDashboards);

    const downloadCSVUrl = urlUtil.appendQueryToUrl(`${baseUrl}/render/csvs/`, urlUtil.toUrlParams(params));

    try {
      dispatch(downloadCSVBegin());
      const response = await lastValueFrom(getBackendSrv().fetch<BlobPart>({url: downloadCSVUrl, method: 'GET', responseType: 'blob'}));
      if (response.status === 204) {
        getAppEvents().publish({
          type: AppEvents.alertWarning.name,
          payload: ['The report does not contain any dashboard with a table panel'],
        });
        return;
      }
      const blob = new Blob([response.data], { type: 'application/zip' });
      saveAs(blob, `${reportTitle||'report-csv'}.zip`);
      getAppEvents().publish({
        type: AppEvents.alertSuccess.name,
        payload: ['CSV downloaded'],
      });
    } catch (error) {
      getAppEvents().publish({
        type: AppEvents.alertError.name,
        payload: ['There was an error downloading the CSV'],
      });
    } finally {
      dispatch(downloadCSVEnd());
    }
  };
}
