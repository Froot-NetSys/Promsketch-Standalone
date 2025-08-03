import { DataQuery, DataSourceInstanceSettings } from '@grafana/data';
import { Modal } from '@grafana/ui';

import { QueryModalModel } from './types';

const queryModalModels: Map<string, QueryModalModel> = new Map<string, QueryModalModel>();

export function addQueryModal(key: string, modal: QueryModalModel) {
  queryModalModels.set(key, modal);
}

export interface Props<TQuery extends DataQuery> {
  query?: TQuery;
  queries?: TQuery[];
  isOpen: boolean;
  modalKey: string;
  onDismiss: () => void;
  onAddQuery?: (q: TQuery) => void;
  onChangeDataSource?: (ds: DataSourceInstanceSettings) => void;
}

export const QueryModal = <TQuery extends DataQuery>({
  query,
  queries,
  isOpen,
  modalKey,
  onDismiss,
  onAddQuery,
  onChangeDataSource,
}: Props<TQuery>) => {
  let content = queryModalModels.get(modalKey);
  if (!content) {
    return null;
  }

  const { title, body: Body } = content as QueryModalModel;
  return (
    <Modal isOpen={isOpen} title={title} onDismiss={onDismiss}>
      <Body
        query={query}
        queries={queries as DataQuery[]}
        onAddQuery={onAddQuery as (q: DataQuery) => void}
        onChangeDataSource={onChangeDataSource}
      />
    </Modal>
  );
};
