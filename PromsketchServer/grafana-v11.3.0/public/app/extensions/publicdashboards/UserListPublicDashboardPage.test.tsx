import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { selectors as e2eSelectors } from '@grafana/e2e-selectors/src';
import config from 'app/core/config';
import { contextSrv } from 'app/core/core';
import { backendSrv } from 'app/core/services/backend_srv';
import { SessionUser } from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/SharePublicDashboardUtils';

import { TestProvider } from '../../../test/helpers/TestProvider';
import { UserListPublicDashboardPage } from '../../features/admin/UserListPublicDashboardPage/UserListPublicDashboardPage';

require('./api/emailSharingApi');

const server = setupServer();

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  getBackendSrv: () => backendSrv,
  reportInteraction: jest.fn(),
}));

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

beforeEach(() => {
  config.licenseInfo = { ...config.licenseInfo, enabledFeatures: { publicDashboardsEmailSharing: true } };
  config.featureToggles.publicDashboardsEmailSharing = true;
  config.featureToggles.publicDashboards = true;

  jest.spyOn(contextSrv, 'hasPermission').mockReturnValue(true);
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  jest.restoreAllMocks();
  server.resetHandlers();
});

const renderPage = () => {
  render(
    <TestProvider>
      <UserListPublicDashboardPage />
    </TestProvider>
  );
};

const selectors = e2eSelectors.pages.UserListPage.publicDashboards;

describe('Success render', () => {
  beforeEach(() => {
    const users: SessionUser[] = [
      {
        email: 'example@example.com',
        firstSeenAtAge: '4 days',
        lastSeenAtAge: '10 minutes',
        totalDashboards: 3,
      },
      {
        email: 'example2@example.com',
        firstSeenAtAge: '25 minutes',
        lastSeenAtAge: '25 minutes',
        totalDashboards: 1,
      },
    ];

    server.use(
      http.get('/api/public-dashboards/share/users', () => {
        return HttpResponse.json(users);
      })
    );
  });

  it('renders loading state', async () => {
    renderPage();
    expect(screen.getByTestId('Spinner')).toBeInTheDocument();
    expect(await screen.findByTestId(selectors.container)).toBeInTheDocument();
  });

  it('renders component', async () => {
    renderPage();
    expect(await screen.findByTestId(selectors.container)).toBeInTheDocument();
  });

  it('renders list with users', async () => {
    renderPage();
    expect(await screen.findByTestId(selectors.container)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});

describe('Fail render', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/public-dashboards/share/users', () => {
        return HttpResponse.json({}, {
          status: 500
        });
      })
    );
  });

  it('renders list without users', async () => {
    renderPage();
    expect(await screen.findByTestId(selectors.container)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });
});
