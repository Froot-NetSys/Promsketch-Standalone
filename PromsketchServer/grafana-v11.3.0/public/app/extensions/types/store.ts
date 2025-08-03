import { StoreState } from 'app/types';

import { SAMLConfigState } from './authConfig';
import { DataSourceCacheState } from './caching';
import { MetaAnalyticsState } from './metaanalytics';
import { DataSourcePermissionState } from './permissions';
import { RecordedQueriesState } from './recordedQuery';
import { ReportsState } from './reports';
import { TeamLBACState } from './teamLBAC';

export interface EnterpriseStoreState extends StoreState {
  dataSourcePermission: DataSourcePermissionState;
  dataSourceCache: DataSourceCacheState;
  reports: ReportsState;
  metaAnalytics: MetaAnalyticsState;
  recordedQueries: RecordedQueriesState;
  samlConfig: SAMLConfigState;
  teamLBAC: TeamLBACState;
}
