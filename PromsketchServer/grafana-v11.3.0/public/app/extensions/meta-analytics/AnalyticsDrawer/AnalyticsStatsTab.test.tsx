import { render, screen } from '@testing-library/react';
import $ from 'jquery';

import { GrafanaTheme2 } from '@grafana/data';
import { defaultDashboard } from '@grafana/schema';
import { DashboardModel } from 'app/features/dashboard/state';

import { getMockDailySummaries } from '../__mocks__/dailySummariesMocks';

import AnalyticsStatsTab, { Props } from './AnalyticsStatsTab';

jest.mock(
  'react-virtualized-auto-sizer',
  () =>
    ({ children }: any) =>
      children({ height: 600, width: 600 })
);
// Mock plot to prevent graph rendering from crashing
//@ts-ignore
$.plot = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});
const setup = (props: Props) => {
  render(<AnalyticsStatsTab {...props} />);
};

describe('Render', () => {
  it('should render empty component - no data', async () => {
    const props: Props = {
      dashboard: new DashboardModel({ ...defaultDashboard, id: 1 }),
      dailySummaries: [],
      theme: {} as GrafanaTheme2,
    };
    setup(props);

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.getByText('No data.')).toBeInTheDocument();
  });

  it('should render query and error counts from daily summaries', async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    const props: Props = {
      dashboard: new DashboardModel({ ...defaultDashboard, id: 1 }),
      dailySummaries: getMockDailySummaries(),
      theme: {} as GrafanaTheme2,
    };
    setup(props);

    expect(await screen.findByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('data-testid Panel header Errors last 30 days')).toBeInTheDocument();
  });
});
