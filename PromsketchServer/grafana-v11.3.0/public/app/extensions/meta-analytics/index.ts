import { config, featureEnabled, registerEchoBackend } from '@grafana/runtime';
import { getConfig } from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';

import { initAnalyticsDrawer } from './AnalyticsDrawer/AnalyticsDashNav';
import { MetaAnalyticsBackend } from './MetaAnalyticsBackend';
import { initPresenceIndicators } from './PresenceIndicators';

export const initMetaAnalytics = () => {
  const analyticsConfigEnabled = getConfig().analytics?.enabled;
  const analyticsLicenseEnabled = featureEnabled('analytics');

  // Initialize calls to /ma/events
  if (analyticsLicenseEnabled) {
    registerEchoBackend(new MetaAnalyticsBackend({ url: getMetaAnalyticsUrl() }));
  }

  if (!analyticsConfigEnabled) {
    return;
  }

  if (analyticsLicenseEnabled) {
    const user = contextSrv.user;
    if (user.isSignedIn) {
      initPresenceIndicators();
      initAnalyticsDrawer();
    }
  } else if (config.featureToggles.featureHighlights) {
    initAnalyticsDrawer();
  }
};

const getMetaAnalyticsUrl = () => {
  const publicDashboardAccessToken = getConfig().publicDashboardAccessToken;
  return publicDashboardAccessToken !== '' ? `api/public/ma/events/${publicDashboardAccessToken}` : 'api/ma/events';
};
