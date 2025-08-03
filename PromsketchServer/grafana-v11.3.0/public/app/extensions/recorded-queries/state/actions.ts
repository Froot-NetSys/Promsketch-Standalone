import { lastValueFrom } from 'rxjs';

import { getBackendSrv } from '@grafana/runtime';
import { ThunkResult } from 'app/types';

import { PrometheusWriteTarget, RecordedQuery } from '../../types';

import {
  deleteRecordedQueries,
  endLoadRecordedQueries,
  loadedRecordedQueries,
  loadRecordedQueries,
  setPrometheusWriteTarget,
  updateRecordedQueries,
} from './reducers';

const baseUrl = 'api/recording-rules';

export function getRecordedQueriesAsync(): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(loadRecordedQueries());
    try {
      const recordedQueries: RecordedQuery[] = await getBackendSrv().get(baseUrl);
      dispatch(loadedRecordedQueries(recordedQueries));
    } finally {
      dispatch(endLoadRecordedQueries());
    }
  };
}

export function updateRecordedQuery(rq: RecordedQuery): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().put(baseUrl, rq);
    dispatch(updateRecordedQueries(rq));
  };
}

export function deleteRecordedQuery(rq: RecordedQuery): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`${baseUrl}/${rq.id}`);
    dispatch(deleteRecordedQueries(rq));
  };
}

export function saveRecordedQuery(rq: RecordedQuery) {
  return lastValueFrom<any>(
    getBackendSrv().fetch({
      method: 'POST',
      url: baseUrl,
      data: rq,
      showErrorAlert: false,
    })
  );
}

export function testRecordedQuery(rq: RecordedQuery) {
  return lastValueFrom<any>(
    getBackendSrv().fetch({
      method: 'POST',
      url: `${baseUrl}/test`,
      data: rq,
      showSuccessAlert: false,
      showErrorAlert: false,
    })
  );
}

export function getPrometheusWriteTarget(): ThunkResult<void> {
  return async (dispatch) => {
    try {
      const w = await lastValueFrom<any>(
        getBackendSrv().fetch({
          method: 'GET',
          url: `${baseUrl}/writer`,
          showSuccessAlert: false,
          showErrorAlert: false,
        })
      );
      dispatch(setPrometheusWriteTarget(w.data));
    } catch (e: any) {
      if (e.status !== 404) {
        console.error(e);
      }
    }
  };
}

export function savePrometheusWriteTarget(w: PrometheusWriteTarget) {
  return lastValueFrom<any>(
    getBackendSrv().fetch({
      method: 'POST',
      url: `${baseUrl}/writer`,
      data: w,
      showSuccessAlert: false,
      showErrorAlert: false,
    })
  );
}
