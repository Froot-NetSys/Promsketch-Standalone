import { lazy } from 'react';

import { config, featureEnabled, reportExperimentView } from '@grafana/runtime';
import { contextSrv } from 'app/core/core';
import { ROUTES as CONNECTION_ROUTES } from 'app/features/connections/constants';
import { isEmailSharingEnabled } from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/SharePublicDashboardUtils';
import { extraRoutes } from 'app/routes/routes';
import { addExtraMiddleware, addRootReducer } from 'app/store/configureStore';
import { AccessControlAction, DashboardRoutes } from 'app/types';

import { initEnterpriseAdmin } from './admin';
import { initAnnouncementBanners } from './announcement-banner';
import { announcementBannerAPI } from './announcement-banner/api';
import { initAuthConfig } from './auth-config';
import { authConfigSAMLReducer } from './auth-config/SAML/state/reducers';
import { initPageBanners } from './banners';
import dataSourceCacheReducers from './caching/state/reducers';
import { initLicenseWarnings } from './licensing';
import { initMetaAnalytics } from './meta-analytics';
import metaAnalyticsReducers from './meta-analytics/state/reducers';
import { initRecordedQueries } from './recorded-queries';
import { recordedQueryReducer } from './recorded-queries/state/reducers';
import { initReporting } from './reports';
import { BASE_URL as REPORTS_BASE } from './reports/constants';
import reportsReducers from './reports/state/reducers';
import { teamLBACReducer } from './teamLBAC/state/reducers';
import { AccessControlAction as EnterpriseAccessControlAction } from './types';
import { buildExperimentID, ExperimentGroup } from './utils/featureHighlights';
import { initWhitelabeling } from './whitelabeling';

export function addExtensionReducers() {
  if (featureEnabled('caching')) {
    addRootReducer(dataSourceCacheReducers);
  }

  if (featureEnabled('reports')) {
    addRootReducer(reportsReducers);
  }

  if (featureEnabled('analytics')) {
    addRootReducer(metaAnalyticsReducers);
  }

  if (featureEnabled('recordedqueries')) {
    addRootReducer(recordedQueryReducer);
  }

  if (featureEnabled('saml')) {
    addRootReducer(authConfigSAMLReducer);
  }

  if (config.featureToggles.teamHttpHeaders) {
    addRootReducer(teamLBACReducer);
  }

  if (config.featureToggles.notificationBanner) {
    if (featureEnabled('announcementBanner')) {
      addRootReducer({
        [announcementBannerAPI.reducerPath]: announcementBannerAPI.reducer,
      });
      addExtraMiddleware(announcementBannerAPI.middleware);
    }
  }
}

function initEnterprise() {
  const highlightsEnabled = config.featureToggles.featureHighlights;
  initLicenseWarnings();
  initReporting();
  initMetaAnalytics();

  if (featureEnabled('saml')) {
    initAuthConfig();
  }

  if (featureEnabled('whitelabeling') || featureEnabled('grafanacloud')) {
    initWhitelabeling();
  }

  if (featureEnabled('recordedqueries')) {
    // TODO: Remove this check when we separate the logic between loading Grafana services and the Public dashboard view
    // this method is called when loading the Grafana services and failing with 401 because it's an auth endpoint,
    // we don't need to load it for the public dashboard view
    if (config.publicDashboardAccessToken === '') {
      initRecordedQueries();
    }
  }

  if (featureEnabled('admin')) {
    initEnterpriseAdmin();
  }

  if (featureEnabled('publicDashboardsEmailSharing')) {
    extraRoutes.push(
      {
        path: '/public-dashboards/:accessToken/request-access',
        component: lazy(
          () => import(/* webpackChunkName: "RequestViewAccessPage" */ './publicdashboards/RequestViewAccessPage')
        ),
        chromeless: true,
      },
      {
        path: '/public-dashboards/:accessToken/confirm-access',
        component: lazy(
          () => import(/* webpackChunkName: "ConfirmAccessPage" */ './publicdashboards/ConfirmAccessPage')
        ),
        chromeless: true,
      }
    );

    if (isEmailSharingEnabled()) {
      import('./publicdashboards/api/emailSharingApi');
    }
  }

  // SAML configuration UI
  if (featureEnabled('saml')) {
    extraRoutes.push({
      path: '/admin/authentication/saml/:step?',
      component: lazy(() => import(/* webpackChunkName: "SetupSAMLPage" */ './auth-config/SAML/SetupSAMLPage')),
    });
  }

  // DataSources / Caching
  const cachePath = '/datasources/edit/:uid/cache';
  const connectionsCachePath = `${CONNECTION_ROUTES.DataSourcesEdit}/cache`;
  if (featureEnabled('caching')) {
    extraRoutes.push({
      path: cachePath,
      component: lazy(() => import(/* webpackChunkName: "DataSourceCachePage" */ './caching/DataSourceCachePage')),
    });
    extraRoutes.push({
      path: connectionsCachePath,
      component: lazy(
        () => import(/* webpackChunkName: "ConnectionsDataSourceCachePage" */ './connections/DataSourceCachePage')
      ),
    });
  } else if (highlightsEnabled) {
    extraRoutes.push({
      path: `${cachePath}/upgrade`,
      component: lazy(
        () => import(/* webpackChunkName: "DataSourceCacheUpgradePage" */ './caching/DataSourceCacheUpgradePage')
      ),
    });
    extraRoutes.push({
      path: `${connectionsCachePath}/upgrade`,
      component: lazy(
        () =>
          import(
            /* webpackChunkName: "ConnectionsDataSourceCacheUpgradePage" */ './connections/DataSourceCacheUpgradePage'
          )
      ),
    });
  }

  // DataSources / Insights
  const insightsPath = '/datasources/edit/:uid/insights';
  const connectionsInsightsPath = `${CONNECTION_ROUTES.DataSourcesEdit}/insights`;
  if (config.analytics?.enabled) {
    if (featureEnabled('analytics')) {
      extraRoutes.push({
        path: insightsPath,
        component: lazy(
          () =>
            import(
              /* webpackChunkName: "DataSourceInsightsPage" */ './meta-analytics/DataSourceInsights/DataSourceInsightsPage'
            )
        ),
      });
      extraRoutes.push({
        path: connectionsInsightsPath,
        component: lazy(
          () =>
            import(/* webpackChunkName: "ConnectionsDataSourceInsightsPage" */ './connections/DataSourceInsightsPage')
        ),
      });
    } else if (highlightsEnabled) {
      extraRoutes.push({
        path: `${insightsPath}/upgrade`,
        component: lazy(
          () =>
            import(
              /* webpackChunkName: "DataSourceInsightsUpgradePage" */ './meta-analytics/DataSourceInsights/DataSourceInsightsUpgradePage'
            )
        ),
      });
      extraRoutes.push({
        path: `${connectionsInsightsPath}/upgrade`,
        component: lazy(
          () =>
            import(
              /* webpackChunkName: "ConnectionsDataSourceInsightsUpgradePage" */ './connections/DataSourceInsightsUpgradePage'
            )
        ),
      });
    }
  }

  // DataSources / Permissions
  const permissionsPath = '/datasources/edit/:uid/permissions';
  const connectionsPermissionsPath = `${CONNECTION_ROUTES.DataSourcesEdit}/permissions`;
  if (featureEnabled('dspermissions.enforcement')) {
    extraRoutes.push({
      path: permissionsPath,
      component: lazy(
        () => import(/* webpackChunkName: "DataSourcePermissionsPage" */ './permissions/DataSourcePermissionsPage')
      ),
    });
    extraRoutes.push({
      path: connectionsPermissionsPath,
      component: lazy(
        () =>
          import(
            /* webpackChunkName: "ConnectionsDataSourcePermissionsPage" */ './connections/DataSourcePermissionsPage'
          )
      ),
    });
  } else if (highlightsEnabled) {
    extraRoutes.push({
      path: permissionsPath + '/upgrade',
      component: lazy(
        () => import(/* webpackChunkName: "DatasourcePermissionsUpgradePage" */ './permissions/UpgradePage')
      ),
    });
    extraRoutes.push({
      path: `${connectionsPermissionsPath}/upgrade`,
      component: lazy(
        () =>
          import(
            /* webpackChunkName: "ConnectionsDataSourcePermissionsUpgradePage" */ './connections/DataSourcePermissionsUpgradePage'
          )
      ),
    });
  }

  if (config.reporting?.enabled) {
    if (featureEnabled('reports')) {
      extraRoutes.push(
        {
          path: REPORTS_BASE,
          component: lazy(() => import(/* webpackChunkName: "ReportsListPage" */ './reports/ReportsListPage')),
        },
        {
          path: `${REPORTS_BASE}/settings`,
          component: lazy(() => import(/* webpackChunkName: "ReportsSettingsPage" */ './reports/ReportsSettingsPage')),
        },
        {
          path: '/d-csv/:uid',
          pageClass: 'dashboard-solo',
          routeName: DashboardRoutes.Normal,
          component: lazy(() => import(/* webpackChunkName: "CSVExportPage" */ './reports/CSVExportPage')),
        }
      );

      if (config.featureToggles.newPDFRendering) {
        extraRoutes.push({
          path: '/d-report/:uid/:slug?',
          component: lazy(
            () => import(/* webpackChunkName: "DashboardReportPage" */ './reports/dashboard/DashboardReportPage')
          ),
        });
      }
    } else if (highlightsEnabled) {
      extraRoutes.push({
        path: REPORTS_BASE,
        component: lazy(() => import(/* webpackChunkName: "ReportsUpgradePage" */ './reports/ReportsUpgradePage')),
      });
    }

    if (featureEnabled('reports.creation')) {
      extraRoutes.push({
        path: `${REPORTS_BASE}/new`,
        component: lazy(() => import(/* webpackChunkName: "ReportPage" */ './reports/ReportForm/ReportPage')),
      });

      extraRoutes.push({
        path: `${REPORTS_BASE}/:step?/:id?`,
        component: lazy(() => import(/* webpackChunkName: "ReportPage" */ './reports/ReportForm/ReportPage')),
      });
    }
  }

  const showRecordQuery = featureEnabled('recordedqueries') && config?.recordedQueries?.enabled;
  if (contextSrv.isEditor && showRecordQuery) {
    extraRoutes.push(
      ...[
        {
          path: '/recorded-queries',
          component: lazy(
            () => import(/* webpackChunkName: "RecordedQueriesConfig" */ './recorded-queries/RecordedQueriesConfig')
          ),
        },
        {
          path: '/recorded-queries/write-target',
          component: lazy(
            () => import(/* webpackChunkName: "WriteTargetConfig" */ './recorded-queries/WriteTargetConfig')
          ),
        },
      ]
    );
  }

  // Announcement banner
  if (config.featureToggles.notificationBanner) {
    if (featureEnabled('announcementBanner')) {
      extraRoutes.push({
        path: '/admin/banner-settings',
        component: lazy(
          () => import(/* webpackChunkName: "BannerSettingsPage" */ './announcement-banner/BannerSettingsPage')
        ),
        roles: () => contextSrv.evaluatePermission([EnterpriseAccessControlAction.ActionBannersWrite]),
      });

      initAnnouncementBanners();
    }
  }

  if (config.featureToggles.groupAttributeSync && featureEnabled('groupsync')) {
    extraRoutes.push({
      path: '/admin/access/groupsync',
      roles: () =>
        contextSrv.evaluatePermission([
          AccessControlAction.GroupSyncMappingsRead,
          AccessControlAction.GroupSyncMappingsWrite,
        ]),
      component: lazy(() => import(/* webpackChunkName: "GroupSync" */ './groupsync/GroupSyncEditor') as any),
    });
  }
}

// initUnlicensed initialized features which are defined in Enterprise but
// should be available when running without a license.
function initUnlicensed() {
  initPageBanners();

  extraRoutes.push({
    path: '/admin/licensing',
    roles: () =>
      contextSrv.evaluatePermission([
        EnterpriseAccessControlAction.LicensingRead,
        AccessControlAction.ActionServerStatsRead,
      ]),
    component: lazy(() => import(/* webpackChunkName: "LicensePage" */ './licensing/LicensePage')),
  });

  // Report experimentation views
  if (contextSrv.isSignedIn && config.licenseInfo.stateInfo !== 'Licensed') {
    reportExperimentView(
      buildExperimentID(),
      config.featureToggles.featureHighlights ? ExperimentGroup.Test : ExperimentGroup.Control,
      ''
    );
  }
}

export function init() {
  initUnlicensed();
  initEnterprise();
}
