import { useState } from 'react';

import { dateTime } from '@grafana/data';
import { config } from '@grafana/runtime';
import { addBodyRenderHook } from 'app/AppWrapper';
import { contextSrv } from 'app/core/services/context_srv';
import store from 'app/core/store';

import { AccessControlAction } from '../types';

import { IsInvalid, HasExpired, ExpiresSoon, TokenExpiresSoon, MaxUsersReached } from './LicenseWarning';
import {
  DISMISS_WARNING_FOR_DAYS,
  LICENSE_WARNING_DISMISS_UNTIL_KEY,
  WARNING_CLOSE_TIMEOUT_SEC,
  LIMIT_BY_USERS,
} from './constants';
import { refreshLicenseStats } from './state/api';
import { ActiveUserStats } from './types';

interface LicensingSettings {
  activeAdminsAndEditors?: number;
  activeViewers?: number;
  activeUsers?: number;
  limitBy?: string;
  includedAdmins?: number;
  includedViewers?: number;
  includedUsers?: number;
  slug?: string;
  licenseExpiry?: number;
  licenseExpiryWarnDays?: number;
  tokenExpiry?: number;
  tokenExpiryWarnDays?: number;
  usageBilling?: boolean;
  isTrial?: boolean;
}

export function initLicenseWarnings() {
  addBodyRenderHook(LicenseWarning);
}

export function LicenseWarning() {
  const [isClosed, setIsClosed] = useState(false);
  const [settings, updateSettings] = useState((config as any).licensing as LicensingSettings);

  const dismissUntil = store.get(LICENSE_WARNING_DISMISS_UNTIL_KEY);
  const hasDismissed = dismissUntil && dismissUntil > dateTime().valueOf();
  const isLicensingReaderOrAdmin = contextSrv.hasPermission(AccessControlAction.LicensingRead);
  const isLicensingReaderOrGrafanaAdmin = contextSrv.hasPermission(AccessControlAction.LicensingRead);
  const showExpireSoon = isLicensingReaderOrAdmin && willExpireSoon() && !hasDismissed;
  const showTokenExpireSoon = isLicensingReaderOrAdmin && tokenWillExpireSoon() && !hasDismissed;
  const usageBillingDisabled = isUsageBillingDisabled();
  let showMaxUsersReached = false;
  let activeUsers = 0;
  let maxUsers = 0;
  if (settings.limitBy === LIMIT_BY_USERS) {
    const maxUsersReached = numberOfActiveUsersReached(settings.includedUsers, settings.activeUsers);

    showMaxUsersReached =
      usageBillingDisabled && maxUsersReached && (isLicensingReaderOrAdmin || isLicensingReaderOrGrafanaAdmin);
    activeUsers = settings.activeUsers!;
    maxUsers = settings.includedUsers!;
  }

  if (isRenderingPanel() || isLicenseAdminPage()) {
    return null;
  }

  const onCloseWarning = () => {
    const dismissTill = dateTime().add(DISMISS_WARNING_FOR_DAYS, 'd').valueOf();
    store.set(LICENSE_WARNING_DISMISS_UNTIL_KEY, dismissTill);
    setIsClosed(true);
  };

  const onRefreshWarning = async () => {
    const activeUserStats: ActiveUserStats | null = await refreshLicenseStats().catch((err) => null);

    if (activeUserStats) {
      const update = {
        ...settings,
        activeUsers: activeUserStats.active_users,
      };

      // update on config object as well
      (config as any).licensing = update;

      updateSettings(update);
    }
  };

  if (isClosed) {
    return null;
  }

  if (isInvalid()) {
    return <IsInvalid isLicensingReader={isLicensingReaderOrGrafanaAdmin} />;
  } else if (hasExpired()) {
    return <HasExpired isLicensingReader={isLicensingReaderOrGrafanaAdmin} />;
  } else if (showMaxUsersReached) {
    return (
      <MaxUsersReached
        activeUsers={activeUsers}
        maxUsers={maxUsers}
        slug={settings.slug}
        onRefreshWarning={isLicensingReaderOrAdmin ? onRefreshWarning : undefined}
      />
    );
  } else if (showExpireSoon) {
    const expiresIn = willExpireInDays();

    // auto hide expire warning in case it's a TV monitor with admin permissions
    setTimeout(onCloseWarning, 1000 * WARNING_CLOSE_TIMEOUT_SEC);

    return (
      <ExpiresSoon
        days={expiresIn}
        onCloseWarning={onCloseWarning}
        isLicensingReader={isLicensingReaderOrGrafanaAdmin}
      />
    );
  } else if (showTokenExpireSoon) {
    const expiresIn = tokenWillExpireInDays();

    // auto hide expire warning in case it's a TV monitor with admin permissions
    setTimeout(onCloseWarning, 1000 * WARNING_CLOSE_TIMEOUT_SEC);

    return (
      <TokenExpiresSoon
        days={expiresIn}
        onCloseWarning={onCloseWarning}
        isLicensingReader={isLicensingReaderOrGrafanaAdmin}
      />
    );
  }

  return null;
}

export function isInvalid(): boolean {
  const { expiry, hasLicense } = (config as any).licenseInfo;
  return hasLicense && !expiry;
}

export function willExpireSoon(): boolean {
  const { licenseExpiry, licenseExpiryWarnDays = 30 } = (config as any).licensing;
  return licenseExpiry > 0 && dateTime(licenseExpiry * 1000) < dateTime().add(licenseExpiryWarnDays, 'd');
}

export function willExpireInDays(): number {
  const { licenseExpiry } = (config as any).licensing;
  return Math.ceil((licenseExpiry - dateTime().unix()) / 3600 / 24);
}

export function hasExpired(): boolean {
  const { licenseExpiry } = (config as any).licensing;
  return licenseExpiry > 0 && dateTime(licenseExpiry * 1000) < dateTime();
}

function tokenWillExpireSoon(): boolean {
  const { tokenExpiry, tokenExpiryWarnDays = 3 } = (config as any).licensing;
  return tokenExpiry > 0 && dateTime(tokenExpiry * 1000) < dateTime().add(tokenExpiryWarnDays, 'd');
}

function tokenWillExpireInDays(): number {
  const { tokenExpiry } = (config as any).licensing;
  return Math.ceil((tokenExpiry - dateTime().unix()) / 3600 / 24);
}

export function numberOfActiveUsersReached(includedUsers?: number, activeUsers?: number): boolean {
  if (includedUsers === undefined || activeUsers === undefined) {
    return false;
  }
  return includedUsers !== -1 && activeUsers > includedUsers;
}

function isUsageBillingDisabled(): boolean {
  const settings = (config as any).licensing as LicensingSettings;
  return !settings.usageBilling;
}

function isSoloPanel(): boolean {
  const soloPanelPattern = /\/d-solo\//;
  const path = window.location.pathname;
  return soloPanelPattern.test(path);
}

function isRenderingPanel(): boolean {
  return isSoloPanel();
}

function isLicenseAdminPage(): boolean {
  const pattern = /\/admin\/licensing$/;
  const path = window.location.pathname;
  return pattern.test(path);
}
