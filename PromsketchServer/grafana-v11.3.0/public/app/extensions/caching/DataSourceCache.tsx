import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Stack, useTheme2 } from '@grafana/ui';
import { UpgradeBox, UpgradeContent, UpgradeContentProps } from 'app/core/components/Upgrade/UpgradeBox';
import { contextSrv } from 'app/core/core';
import { highlightTrial } from 'app/features/admin/utils';
import { loadDataSource, loadDataSourceMeta } from 'app/features/datasources/state/actions';

import { AccessControlAction, EnterpriseStoreState } from '../types';

import { CacheCTA } from './CacheCTA';
import { CacheClean } from './CacheClean';
import { CacheSettingsForm } from './CacheSettingsForm';
import {
  loadDataSourceCache,
  enableDataSourceCache,
  disableDataSourceCache,
  updateDataSourceCache,
  cleanCache,
} from './state/actions';

export type ExternalProps = {
  uid: string;
};

function mapStateToProps(state: EnterpriseStoreState, props: ExternalProps) {
  return {
    ...state.dataSourceCache,
    pageId: props.uid,
    dataSource: state.dataSources.dataSource,
  };
}

const mapDispatchToProps = {
  disableDataSourceCache,
  updateDataSourceCache,
  enableDataSourceCache,
  loadDataSourceCache,
  loadDataSource,
  cleanCache,
  loadDataSourceMeta,
};

export const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = ConnectedProps<typeof connector>;

export const Caching = (props: Props) => {
  const [enabled, setEnabled] = useState(props.enabled);
  const [loading, setLoading] = useState(true);
  const [useDefaultTTL, setUseDefaultTTL] = useState(props.useDefaultTTL);
  const [ttlQueriesMs, setTtlQueriesMs] = useState(props.ttlQueriesMs);
  const [ttlResourcesMs, setTtlResourcesMs] = useState(props.ttlResourcesMs);

  const { pageId, dataSource, loadDataSource, loadDataSourceCache, loadDataSourceMeta, enableDataSourceCache } = props;

  useEffect(() => {
    setEnabled(dataSource.jsonData?.disableGrafanaCache ? false : props.enabled);
    setUseDefaultTTL(props.useDefaultTTL);
    setTtlQueriesMs(props.ttlQueriesMs);
    setTtlResourcesMs(props.ttlResourcesMs);
    setLoading(false);
  }, [
    props.useDefaultTTL,
    props.ttlQueriesMs,
    props.ttlResourcesMs,
    props.enabled,
    dataSource.jsonData?.disableGrafanaCache,
  ]);

  useEffect(() => {
    loadDataSource(pageId).then(loadDataSourceMeta);
    loadDataSourceCache(pageId);
  }, [loadDataSourceCache, loadDataSource, loadDataSourceMeta, pageId]);

  const canWriteCache = contextSrv.hasPermissionInMetadata(AccessControlAction.DataSourcesCachingWrite, dataSource);

  const content = enabled ? (
    CacheSettingsForm({
      ...props,
      loading,
      useDefaultTTL,
      setUseDefaultTTL,
      ttlQueriesMs,
      setTtlQueriesMs,
      ttlResourcesMs,
      setTtlResourcesMs,
    })
  ) : highlightTrial() ? (
    <DataSourceCacheUpgradeContent
      action={
        canWriteCache
          ? {
              text: 'Enable caching',
              onClick: () => {
                enableDataSourceCache(pageId);
              },
            }
          : undefined
      }
    />
  ) : (
    CacheCTA(props)
  );

  return (
    <>
      {highlightTrial() && (
        <UpgradeBox
          featureId={'query-caching'}
          eventVariant={'trial'}
          featureName={'query caching'}
          text="Enable query caching for free during your trial of Grafana Pro."
        />
      )}
      <div className="page-action-bar">
        {enabled && !highlightTrial() && <h3 className="page-sub-heading">Caching</h3>}
        <div className="page-action-bar__spacer" />
        <Stack gap={2} alignItems="flex-end" justifyContent="flex-end">
          {enabled && <CacheClean {...props} />}
        </Stack>
      </div>
      {content}
    </>
  );
};

export interface DataSourceCacheUpgradeContentProps {
  action?: UpgradeContentProps['action'];
}
export const DataSourceCacheUpgradeContent = ({ action }: DataSourceCacheUpgradeContentProps) => {
  const theme = useTheme2();

  return (
    <UpgradeContent
      action={action}
      listItems={[
        'Load dashboards in less than a second from the cache, even when they include big queries and lots of users are looking at once',
        'Save money and avoid rate limiting by reducing the number of API calls you make to data sources like Splunk, CloudWatch and Github',
        'Author dashboards more smoothly by caching the data used to construct queries, like fields in ServiceNow or metrics available from Datadog',
      ]}
      image={`query-caching-${theme.isLight ? 'light' : 'dark'}.png`}
      featureUrl={'https://grafana.com/docs/grafana/latest/enterprise/query-caching'}
      featureName={'query caching'}
      description={
        'With query caching, you can load dashboards faster and reduce costly queries to data sources by temporarily storing query results in memory, Redis, or Memcached.'
      }
    />
  );
};

export default connector(Caching);
