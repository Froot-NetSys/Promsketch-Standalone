import { Button } from '@grafana/ui';
import { contextSrv } from 'app/core/core';

import { AccessControlAction } from '../types';

import { Props } from './DataSourceCache';

export const CacheSettingsDisable = (props: Props) => {
  const { disableDataSourceCache, dataSource, pageId } = props;
  const canWriteCache = contextSrv.hasPermissionInMetadata(AccessControlAction.DataSourcesCachingWrite, dataSource);

  return (
    <Button variant="destructive" onClick={() => disableDataSourceCache(pageId)} disabled={!canWriteCache}>
      Disable
    </Button>
  );
};
