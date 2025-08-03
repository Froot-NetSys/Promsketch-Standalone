export interface DataSourceCacheState {
  dataSourceID: number;
  dataSourceUID: string;
  ttlQueriesMs: number;
  ttlResourcesMs: number;
  // All datasources, if "enabled = true" in the caching section, have caching enabled by default
  enabled: boolean;
  useDefaultTTL: boolean;
  defaultTTLMs: number;
}

export interface DataSourceCacheDTO extends DataSourceCacheState {}
