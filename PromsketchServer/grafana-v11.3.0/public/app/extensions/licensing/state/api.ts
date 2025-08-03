import { getBackendSrv } from 'app/core/services/backend_srv';

import { ActiveUserStats, LicenseToken } from '../types';

export const getLicenseToken = async (): Promise<LicenseToken> => {
  return getBackendSrv().get('/api/licensing/token');
};

export const postLicenseToken = async (token: string): Promise<LicenseToken> => {
  return getBackendSrv().post('/api/licensing/token', { token: token });
};

export const renewLicenseToken = async (): Promise<LicenseToken> => {
  return getBackendSrv().post('/api/licensing/token/renew', {});
};

export const refreshLicenseStats = async (): Promise<ActiveUserStats> => {
  return getBackendSrv().get('/api/licensing/refresh-stats');
};
