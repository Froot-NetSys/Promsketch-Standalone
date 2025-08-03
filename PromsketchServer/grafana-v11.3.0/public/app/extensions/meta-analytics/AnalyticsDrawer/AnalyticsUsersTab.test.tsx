import { render, screen, waitFor, within } from '@testing-library/react';
import $ from 'jquery';

import { createTheme } from '@grafana/data';
import { defaultDashboard } from '@grafana/schema';
import { DashboardModel } from 'app/features/dashboard/state';

import { getMockDailySummaries } from '../__mocks__/dailySummariesMocks';
import { getMockRecentUsers } from '../__mocks__/recentUsersMocks';
import { getDashboardUsersInfo, DashboardDailySummaryDTO, UserViewDTO } from '../api';

import { AnalyticsUsersTab, Props } from './AnalyticsUsersTab';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock(
  'react-virtualized-auto-sizer',
  () =>
    ({ children }: any) =>
      children({ height: 600, width: 600 })
);

jest.mock('../api', () => {
  return {
    getDashboardUsersInfo: jest.fn((dashboardId: number) => {
      const recentUsers = getMockRecentUsers();
      return Promise.resolve({
        creator: dashboardId ? recentUsers[0] : null,
        lastEditor: dashboardId ? recentUsers[1] : null,
      });
    }),
  };
});
//@ts-ignore
$.plot = jest.fn();

const setup = (dashboard: DashboardModel, dailySummaries: DashboardDailySummaryDTO[], userViews: UserViewDTO[]) => {
  const props: Props = {
    dashboard,
    dailySummaries,
    userViews,
    theme: createTheme(),
    setDrawerOpen: jest.fn() as any,
  };
  render(<AnalyticsUsersTab {...props} />);
};

describe('Render', () => {
  it('should render empty component - no data', async () => {
    setup(new DashboardModel({ ...defaultDashboard, id: 0 }), [], []);
    await waitFor(() => {
      expect(getDashboardUsersInfo).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByLabelText('User information box')).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('should render dashboard meta information', async () => {
    setup(new DashboardModel({ ...defaultDashboard, id: 1 }), [], []);
    expect(getDashboardUsersInfo).toHaveBeenCalledTimes(1);

    expect(await screen.findAllByLabelText('User information box')).toHaveLength(2);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('should render views from daily summaries', async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    setup(new DashboardModel({ ...defaultDashboard, id: 0 }), getMockDailySummaries(), []);

    expect(await screen.findByRole('main')).toBeInTheDocument();
    expect(screen.queryByLabelText('User information box')).not.toBeInTheDocument();
    expect(screen.getByTestId('data-testid Panel header Views last 30 days')).toBeInTheDocument();
  });

  it('should not render version history button', async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    const userViews = getMockRecentUsers();
    setup(new DashboardModel({ ...defaultDashboard, id: 0 }, { canEdit: false }), [], userViews);

    expect(await screen.findByRole('main')).toBeInTheDocument();
    expect(screen.queryByLabelText('Version history button')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(userViews.length + 1);
  });

  it('should render recent users information', async () => {
    const userViews = getMockRecentUsers();
    setup(new DashboardModel({ ...defaultDashboard, id: 0 }, { showSettings: true }), [], userViews);

    expect(await screen.findByRole('main')).toBeInTheDocument();
    expect(screen.getAllByLabelText('User information box')).toHaveLength(1);
    expect(screen.getByLabelText('User box title')).toHaveTextContent('Last viewed');
    expect(screen.getByLabelText('Version history button')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(userViews.length + 1);
    expect(screen.getAllByRole('cell')).toHaveLength(3 * userViews.length);
    const { getAllByRole } = within(screen.getByRole('table'));
    expect(getAllByRole('button', { name: /User \d+ icon/i })).toHaveLength(userViews.length);
  });
});
