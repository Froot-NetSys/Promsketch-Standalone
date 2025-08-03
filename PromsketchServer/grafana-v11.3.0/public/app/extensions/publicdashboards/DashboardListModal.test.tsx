import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { selectors as e2eSelectors } from '@grafana/e2e-selectors/src';
import { backendSrv } from 'app/core/services/backend_srv';
import { SessionDashboard } from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/SharePublicDashboardUtils';

import { TestProvider } from '../../../test/helpers/TestProvider';
import { DashboardsListModal } from '../../features/admin/UserListPublicDashboardPage/DashboardsListModalButton';

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

afterAll(() => {
  server.close();
});

afterEach(() => {
  jest.restoreAllMocks();
  server.resetHandlers();
});

const selectors = e2eSelectors.pages.UserListPage.UsersListPublicDashboardsPage.DashboardsListModal;
const renderPage = () => {
  render(
    <TestProvider>
      <DashboardsListModal email="test@test.com" onDismiss={() => {}} />
    </TestProvider>
  );
};

const dashboards: SessionDashboard[] = [
  {
    dashboardTitle: 'A dashboard title 1',
    dashboardUid: 'dashboard-uid-1',
    publicDashboardAccessToken: 'public-dashboard-access-token-1',
    slug: 'a-dashboard-title-1',
  },
  {
    dashboardTitle: 'A dashboard title 2',
    dashboardUid: 'dashboard-uid-2',
    publicDashboardAccessToken: 'public-dashboard-access-token-2',
    slug: 'a-dashboard-title-2',
  },
];

describe('Success render', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/public-dashboards/share/users/:email/dashboards', () => {
        return HttpResponse.json(dashboards);
      })
    );
  });

  it('renders loading state', async () => {
    renderPage();
    expect(screen.getByTestId('Spinner')).toBeInTheDocument();
    expect(await screen.findByText('Public dashboards')).toBeInTheDocument();
  });

  it('renders title and list', async () => {
    renderPage();
    expect(await screen.findByText('Public dashboards')).toBeInTheDocument();
    dashboards.forEach((dash) => {
      expect(screen.getByTestId(selectors.listItem(dash.dashboardUid))).toBeInTheDocument();
    });
  });
});

describe('Fail render', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/public-dashboards/share/users/:email/dashboards', () => {
        return HttpResponse.json({}, {
          status: 500
        })
      })
    );
  });

  it('renders list without dashboards', async () => {
    renderPage();
    expect(await screen.findByText('Public dashboards')).toBeInTheDocument();
    dashboards.forEach((dash) => {
      expect(screen.queryByTestId(selectors.listItem(dash.dashboardUid))).not.toBeInTheDocument();
    });
  });
});
