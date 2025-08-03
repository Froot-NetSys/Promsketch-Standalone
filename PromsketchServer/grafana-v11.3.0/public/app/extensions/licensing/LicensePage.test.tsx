import { render, screen } from '@testing-library/react';

import { LicenseInfo, Props } from './LicenseInfo';
import { LicenseToken } from './types';

import * as index from './index';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: {
    ...jest.requireActual('@grafana/runtime').config,
    buildInfo: {
      edition: 'Enterprise',
      version: '9.0.0',
      commit: 'abc456',
      env: 'dev',
      latestVersion: '',
      hasUpdate: false,
      hideVersion: false,
    },
    bootData: {
      navTree: [],
      user: {},
      settings: {
        anonymousEnabled: true,
      },
    },
    licensing: {
      limitBy: 'users',
      includedUsers: -1,
      slug: '',
      licenseExpiry: 1610976490,
      licenseExpiryWarnDays: 0,
      tokenExpiry: 1610976490,
      tokenExpiryWarnDays: 0,
      usageBilling: false,
    },
    licenseInfo: {},
    featureToggles: {
      noBasicRole: true,
    },
  },
}));
// set Grafana Admin to true to give the right permissions to view the licensing page and warnings
jest.mock('app/core/services/context_srv', () => {
  const contextSrv = jest.requireActual('../../core/services/context_srv');
  contextSrv.contextSrv.isGrafanaAdmin = true;
  jest.spyOn(contextSrv.contextSrv, 'hasPermission').mockImplementation((action) => true);
  return contextSrv;
});
jest.spyOn(index, 'initLicenseWarnings').mockImplementation(() => {});

const validToken: LicenseToken = {
  status: 1,
  jti: '805',
  iss: 'https://test.com',
  sub: 'https://test.com',
  iat: 1578576782,
  exp: 2610976490,
  nbf: 1578576526,
  lexp: 1610976490,
  lid: '10500',
  limit_by: 'users',
  included_users: 110,
  prod: ['grafana-enterprise'],
  company: 'Test',
  slug: '',
  anonymousRatio: 3,
};

const validUsersToken: LicenseToken = {
  status: 1,
  jti: '805',
  iss: 'https://test.com',
  sub: 'https://test.com',
  iat: 1578576782,
  exp: 2610976490,
  nbf: 1578576526,
  lexp: 1610976490,
  lid: '10500',
  limit_by: 'users',
  included_users: 110,
  prod: ['grafana-enterprise'],
  company: 'Test',
  slug: '',
  anonymousRatio: 3,
};

const expiredToken: LicenseToken = {
  status: 5,
  jti: '14',
  iss: 'https://test.com',
  sub: 'https://test.com',
  iat: 1539191907,
  exp: 1577854800,
  nbf: 1539191759,
  lexp: 1577854800,
  lid: '5',
  limit_by: 'users',
  included_users: -1,
  prod: ['grafana-enterprise'],
  company: 'Test',
  slug: '',
  anonymousRatio: 3,
};

const trialToken: LicenseToken = {
  status: 1,
  jti: '805',
  iss: 'https://test.com',
  sub: 'https://test.com',
  iat: 1578576782,
  exp: 2610976490,
  nbf: 1578576526,
  lexp: 1610976490,
  lid: '10500',
  limit_by: 'users',
  included_users: 110,
  prod: ['grafana-enterprise'],
  company: 'Test',
  slug: '',
  trial: true,
  trial_exp: 2610976490,
  anonymousRatio: 3,
};

const trialExpiredToken: LicenseToken = {
  status: 1,
  jti: '805',
  iss: 'https://test.com',
  sub: 'https://test.com',
  iat: 1578576782,
  exp: 2610976490,
  nbf: 1578576526,
  lexp: 1610976490,
  lid: '10500',
  limit_by: 'users',
  included_users: 110,
  prod: ['grafana-enterprise'],
  company: 'Test',
  slug: '',
  trial: true,
  trial_exp: 1577854800,
  anonymousRatio: 3,
};

const activeUserStats = {
  active_users: 3,
  active_anonymous_devices: 0,
};

afterEach(jest.clearAllMocks);

const setup = (propOverrides?: Partial<Props>) => {
  const props: Props = {
    tokenUpdated: false,
    tokenRenewed: false,
    token: validToken,
    stats: activeUserStats,
  };

  Object.assign(props, propOverrides);

  render(<LicenseInfo {...props} />);
};

describe('LicensePage', () => {
  it('should show license info for valid license', async () => {
    setup();

    expect(await screen.findByRole('heading', { name: 'License' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Token' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Utilization' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should show license warning for invalid license', async () => {
    setup({ token: expiredToken });
    expect(await screen.findAllByRole('alert')).toHaveLength(3);
    expect(
      screen.getAllByText('Contact support to renew your token, or visit the Cloud portal to learn more.')
    ).toHaveLength(2);
    expect(screen.getByText('Token expired')).toBeInTheDocument();
  });

  it('should show warning when user utilization is reaching limits', async () => {
    setup({ token: validUsersToken, stats: { ...activeUserStats, active_users: 101, active_anonymous_devices: 3 } });

    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('Reaching limit: active users')).toBeInTheDocument();
    expect(screen.getByText('User utilization reaching limit')).toBeInTheDocument();
    expect(screen.getByText(/There are 102 active users. You are approaching your limit of 110 active users/i));
  });

  it('should show warning when user utilization is at limits', async () => {
    setup({ token: validUsersToken, stats: { ...activeUserStats, active_users: 110 } });

    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('Limit reached: active users')).toBeInTheDocument();
    expect(screen.getByText('User utilization limit reached')).toBeInTheDocument();
    expect(screen.getByText(/You are at your limit of 110 active users/i));
  });

  it('should show alert when user utilization is over limits', async () => {
    setup({ token: validUsersToken, stats: { ...activeUserStats, active_users: 111, active_anonymous_devices: 0 } });

    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('Quota exceeded: active users')).toBeInTheDocument();
    expect(screen.getByText('User limit exceeded')).toBeInTheDocument();
    expect(screen.getByText(/There are more than 110 active users using Grafana./i));
  });

  it('should show notice when in a trial', async () => {
    setup({ token: trialToken });

    expect(await screen.findAllByRole('status')).toHaveLength(1);
    expect(screen.getByText('Trial active')).toBeInTheDocument();
    expect(screen.getByText(/Your trial expires in \d+ day\(s\)/i)).toBeInTheDocument();
  });

  it('should show notice when a trial has expired', async () => {
    setup({ token: trialExpiredToken });

    expect(await screen.findAllByRole('alert')).toHaveLength(1);
    expect(screen.getByText('Trial expired')).toBeInTheDocument();
    expect(screen.getByText(/Your trial period has expired/i)).toBeInTheDocument();
  });

  it('should construct a details link from token properties if none is provided', async () => {
    setup({ token: validToken });

    expect(await screen.findByRole('heading', { name: 'License' })).toBeInTheDocument();
    const licenseDetailsButton = screen.getByLabelText(/View details about your license/);

    expect(licenseDetailsButton).toBeInTheDocument();
    expect(licenseDetailsButton).toHaveAttribute('href', `${validToken.iss}/licenses/${validToken.lid}`);
  });

  it('should use details link provided in token', async () => {
    setup({ token: { ...validToken, details_url: 'http://example.com/foobar-license' } });

    expect(await screen.findByRole('heading', { name: 'License' })).toBeInTheDocument();
    const licenseDetailsButton = screen.getByLabelText(/View details about your license/);

    expect(licenseDetailsButton).toBeInTheDocument();
    expect(licenseDetailsButton).toHaveAttribute('href', 'http://example.com/foobar-license');
  });
});
