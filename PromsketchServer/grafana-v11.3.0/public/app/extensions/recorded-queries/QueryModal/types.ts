import { DataQuery, DataSourceInstanceSettings } from '@grafana/data';

export interface QueryModalModel {
  title: string;
  body: QueryModalBody;
}

export interface QueryModalBodyProps {
  query?: DataQuery;
  queries?: DataQuery[];
  onAddQuery?: (q: DataQuery) => void;
  onChangeDataSource?: (ds: DataSourceInstanceSettings) => void;
}

export type QueryModalBody = React.ComponentType<QueryModalBodyProps>;
