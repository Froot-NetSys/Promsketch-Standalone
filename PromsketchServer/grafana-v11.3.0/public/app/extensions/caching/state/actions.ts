import { getBackendSrv } from 'app/core/services/backend_srv';
import { ThunkResult } from 'app/types';

import { DataSourceCacheDTO } from '../../types';

export enum ActionTypes {
  LoadDataSourceCache = 'LOAD_DATA_SOURCE_CACHE',
}

export interface LoadDataSourceCacheAction {
  type: ActionTypes.LoadDataSourceCache;
  payload: DataSourceCacheDTO;
}

const dataSourceCacheLoaded = (dataSourceCache: DataSourceCacheDTO): LoadDataSourceCacheAction => ({
  type: ActionTypes.LoadDataSourceCache,
  payload: dataSourceCache,
});

export type Action = LoadDataSourceCacheAction;

export function enableDataSourceCache(uid: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().post(`/api/datasources/${uid}/cache/enable`, {});
    dispatch(dataSourceCacheLoaded(response));
  };
}

export function disableDataSourceCache(uid: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().post(`/api/datasources/${uid}/cache/disable`, {});
    dispatch(dataSourceCacheLoaded(response));
  };
}

export function updateDataSourceCache(uid: string, config: DataSourceCacheDTO): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().post(`/api/datasources/${uid}/cache`, config);
    dispatch(dataSourceCacheLoaded(response));
  };
}

export function loadDataSourceCache(uid: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/datasources/${uid}/cache`);
    dispatch(dataSourceCacheLoaded(response));
  };
}

export function cleanCache(uid: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().post(`/api/datasources/${uid}/cache/clean`, {});
    dispatch(dataSourceCacheLoaded(response));
  };
}
