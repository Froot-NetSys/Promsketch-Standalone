import { DataQuery, DataSourceRef } from '@grafana/data';

export interface RecordedQuery {
  id: string;
  target_ref_id: string;
  name: string;
  prom_name: string;
  description: string;
  range: number;
  count: boolean;
  interval: number;
  active: boolean;
  queries: IdDataQuery[];
  dest_data_source_uid: string;
}

export interface RecordedQueriesState {
  recordedQueries: RecordedQuery[];
  isLoading: boolean;
  errorRecordedQueryTestResponse: string;
  prometheusWriteTarget?: PrometheusWriteTarget;
}

export interface IdDataQuery extends DataQuery {
  /** deprecated: the datasource now includes uid */
  datasourceId: number;
  datasource: DataSourceRef;
}

export interface PrometheusWriteTarget {
  data_source_uid: string;
  remote_write_path: string;
}
