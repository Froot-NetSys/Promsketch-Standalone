import { dateTime } from '@grafana/data';
import { config } from '@grafana/runtime';

import { CardState } from './LicenseCard';
import { ERROR_RATE, WARNING_RATE, LIMIT_BY_USERS } from './constants';
import { ActiveUserStats, LicenseToken } from './types';

type Status = { state: CardState; status: string; title: string; message: string };

export const getUserStatMessage = (includedUsers: number, activeUsers?: number): string => {
  return (activeUsers ? `${activeUsers} of ` : '') + (includedUsers > 0 ? includedUsers : 'unlimited');
};

const tokenExpired = (token: LicenseToken) => {
  return dateTime(token.exp * 1000) < dateTime();
};

const tokenWillExpireSoon = (token: LicenseToken) => {
  return dateTime(token.exp * 1000) < dateTime().add((config as any).licensing.tokenExpiryWarnDays, 'd');
};

const tokenWillExpireInDays = (token: LicenseToken) => {
  return Math.ceil((token.exp - dateTime().unix()) / 3600 / 24);
};

export const getTokenStatus = (token: LicenseToken | null): Status => {
  if (!token) {
    return { state: '', status: '', title: '', message: '' };
  }

  if (tokenExpired(token)) {
    return {
      state: 'error',
      status: 'Expired',
      title: 'Token expired',
      message: 'Contact support to renew your token, or visit the Cloud portal to learn more.',
    };
  }

  if (tokenWillExpireSoon(token)) {
    return {
      state: 'warning',
      status: ` Expiring in ${tokenWillExpireInDays(token)} day(s)`,
      title: 'Token expires soon',
      message: `Your token expires in ${tokenWillExpireInDays(token)} day(s). Contact support to renew your token.`,
    };
  }

  return { state: '', status: '', title: '', message: '' };
};

const trialExpired = (token: LicenseToken) => {
  return token.trial_exp && dateTime(token.trial_exp * 1000) < dateTime();
};

const trialWillExpireInDays = (token: LicenseToken) => {
  if (!token.trial_exp) {
    return 0;
  }
  return Math.ceil((token.trial_exp - dateTime().unix()) / 3600 / 24);
};

export const calculateActiveUsers = (stats: ActiveUserStats | null | undefined,
  token: LicenseToken | null): number => {
  const { active_users = 0, active_anonymous_devices = 0 } = stats || {};
  const activeUsers = active_users + Math.floor(active_anonymous_devices / (token?.anonymousRatio || 1));
  return activeUsers;
}

export const getTrialStatus = (token: LicenseToken | null): Status => {
  if (!token || !token.trial || !token.trial_exp) {
    return { state: '', status: '', title: '', message: '' };
  }

  if (trialExpired(token)) {
    return {
      state: 'error',
      status: 'Expired',
      title: 'Trial expired',
      message: 'Your trial period has expired, please contact sales to purchase a license.',
    };
  }

  return {
    state: 'info',
    status: ` Trial expiring in ${trialWillExpireInDays(token)} day(s)`,
    title: 'Trial active',
    message: `Your trial expires in ${trialWillExpireInDays(
      token
    )} day(s), please contact sales to purchase a license.`,
  };
};

export const getRate = (total: number, value = 0) => {
  return (100 * value) / total;
};

export const getUtilStatus = (token: LicenseToken | null, stats?: ActiveUserStats | null): Status => {
  let state: CardState = '';
  let status = '';
  let title = '';
  let message = '';

  if (!token) {
    return {
      state,
      status,
      title,
      message,
    };
  }

  if (token.limit_by === LIMIT_BY_USERS) {
    const activeUsers = calculateActiveUsers(stats, token)
    const totalUsers = token.included_users;
    let userRate = 0;
    if (typeof activeUsers === 'number') {
      userRate = getRate(totalUsers, activeUsers);
    }

    if (userRate > ERROR_RATE) {
      state = 'error';
      status = 'Quota exceeded: active users';
      title = 'User limit exceeded';
      message = `There are more than ${totalUsers} active users using Grafana.`;
      message += ' Contact support to increase the quotas.';
    } else if (userRate >= WARNING_RATE) {
      state = 'warning';
      if (userRate >= ERROR_RATE) {
        status = 'Limit reached';
        title = 'User utilization limit reached';
        message = `You are at your limit of ${totalUsers} active users.`;
      } else {
        status = 'Reaching limit';
        title = 'User utilization reaching limit';
        message = `There are ${activeUsers} active users.`;
        message += ` You are approaching your limit of ${totalUsers} active users.`;
      }
      status += ': active users';
      message += ' Contact support to increase the quotas.';
    }
  }

  return {
    state,
    status,
    title,
    message,
  };
};
