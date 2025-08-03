import { config, featureEnabled } from '@grafana/runtime';
import { isExpressionReference } from '@grafana/runtime/src/utils/DataSourceWithBackend';
import { contextSrv } from 'app/core/core';
import { GroupActionComponents, RowActionComponents } from 'app/features/query/components/QueryActionComponent';
import { store, dispatch } from 'app/store/store';

import { EnterpriseStoreState } from '../types';

import { RecordedQueryAddModal } from './RecordedQueryAddModal';
import { CreateRecordedQuery } from './RecordedQueryCreateModal';
import { getPrometheusWriteTarget } from './state/actions';

const hasWriteTarget = (): boolean => {
  const state = store.getState() as EnterpriseStoreState;
  const target = state.recordedQueries.prometheusWriteTarget;
  return Boolean(target?.data_source_uid) && Boolean(target?.remote_write_path);
};

export function initRecordedQueries() {
  const showRecordQuery = featureEnabled('recordedqueries') && config?.recordedQueries?.enabled;
  if (!showRecordQuery) {
    return;
  }

  if (contextSrv.user.orgRole !== '') {
    dispatch(getPrometheusWriteTarget());
  }

  RowActionComponents.addExtraRenderAction((props) =>
    hasWriteTarget() && (props.dataSource?.meta.backend || isExpressionReference(props.dataSource)) ? (
      <CreateRecordedQuery {...props} />
    ) : null
  );

  GroupActionComponents.addExtraRenderAction((props) =>
    hasWriteTarget() ? <RecordedQueryAddModal {...props} /> : null
  );
}
