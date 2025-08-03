import { render, screen, waitFor } from '@testing-library/react';

import { defaultDashboard } from '@grafana/schema';
import { DashboardModel } from 'app/features/dashboard/state';

import { PresenceIndicators, PresenceIndicatorsProps } from './PresenceIndicators';
import { getMockRecentUsers } from './__mocks__/recentUsersMocks';
import { getRecentUsers } from './api';

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

jest.mock('./api', () => {
  return {
    getRecentUsers: jest.fn((dashboardId: number) => Promise.resolve(getMockRecentUsers().slice(0, dashboardId))),
  };
});
jest.mock('app/core/services/context_srv', () => {
  return {
    contextSrv: { user: { id: 1 } },
  };
});

const setup = (dashboardId: number) => {
  const props: PresenceIndicatorsProps = {
    dashboard: new DashboardModel({ ...defaultDashboard, id: dashboardId }, { url: 'testdashboard' }),
    openDrawer: jest.fn(),
  };

  render(<PresenceIndicators {...props} />);
};

describe('Render', () => {
  it('should render component - no dashboard', async () => {
    setup(0);
    expect(getRecentUsers).not.toHaveBeenCalled();

    await waitFor(() => screen.queryByLabelText('Presence indicators container'));
    expect(screen.queryByLabelText('Presence indicators container')).not.toBeInTheDocument();
  });

  it('should render component - only current user', async () => {
    setup(1);
    expect(getRecentUsers).toHaveBeenCalledTimes(1);
    expect(getRecentUsers).toHaveBeenCalledWith(1, 14);

    await waitFor(() => screen.queryByLabelText('Presence indicators container'));
    expect(screen.queryByLabelText('Presence indicators container')).not.toBeInTheDocument();
  });

  it('should render component - few users (all should be displayed)', async () => {
    setup(3);
    expect(getRecentUsers).toHaveBeenCalledTimes(1);
    expect(getRecentUsers).toHaveBeenCalledWith(3, 14);

    expect(await screen.findAllByAltText(/avatar/)).toHaveLength(2);
    expect(await screen.findAllByRole('button', { name: /icon/ })).toHaveLength(2);
    expect(screen.queryByLabelText('Extra users icon')).not.toBeInTheDocument();
  });

  it('should render component - more users (more icon should be displayed)', async () => {
    setup(6);

    expect(getRecentUsers).toHaveBeenCalledTimes(1);
    expect(getRecentUsers).toHaveBeenCalledWith(6, 14);

    expect(await screen.findAllByAltText(/avatar/)).toHaveLength(4);
    expect(await screen.findAllByRole('button', { name: /icon/ })).toHaveLength(5);
    expect(screen.getByLabelText('Extra users icon')).toBeInTheDocument();
  });
});
