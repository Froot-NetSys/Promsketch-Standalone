// Permission actions (Enterprise-specific)
export enum AccessControlAction {
  ReportingCreate = 'reports:create',
  ReportingWrite = 'reports:write',
  ReportingDelete = 'reports:delete',
  ReportingRead = 'reports:read',
  ReportingSend = 'reports:send',
  ReportingSettingsWrite = 'reports.settings:write',
  ReportingSettingsRead = 'reports.settings:read',

  DataSourcesPermissionsRead = 'datasources.permissions:read',
  DataSourcesPermissionsWrite = 'datasources.permissions:write',
  DataSourcesCachingWrite = 'datasources.caching:write',

  LicensingRead = 'licensing:read',
  LicensingWrite = 'licensing:write',
  LicensingReportsRead = 'licensing.reports:read',

  DashboardsInsightsRead = 'dashboards.insights:read',
  ActionBannersWrite = 'banners:write',
}
