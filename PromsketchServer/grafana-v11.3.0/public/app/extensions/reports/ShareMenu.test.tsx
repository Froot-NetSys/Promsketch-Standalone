import { render, screen } from '@testing-library/react';

import { selectors as e2eSelectors } from '@grafana/e2e-selectors';
import { SceneTimeRange, VizPanel } from '@grafana/scenes';
import config from 'app/core/config';
import { DefaultGridLayoutManager } from 'app/features/dashboard-scene/scene/layout-default/DefaultGridLayoutManager';

import { contextSrv } from '../../core/services/context_srv';
import { DashboardScene, DashboardSceneState } from '../../features/dashboard-scene/scene/DashboardScene';
import ShareMenu, {
  resetDashboardShareDrawerItems,
} from '../../features/dashboard-scene/sharing/ShareButton/ShareMenu';
import { AccessControlAction } from '../types';

import { selectors } from './e2e-selectors/selectors';

import { initReporting } from './index';

const selector = {
  ...e2eSelectors.pages.Dashboard.DashNav.newShareButton.menu,
  ...selectors.components.NewShareButton.Menu,
};

describe('ShareMenu', () => {
  afterEach(() => {
    config.licenseInfo = { ...config.licenseInfo, enabledFeatures: { ['reports.creation']: false } };
    contextSrv.user.permissions = {
      [AccessControlAction.ReportingCreate]: false,
    };
    resetDashboardShareDrawerItems();
  });

  it('should render schedule report menu item when feature enabled and user permission granted', async () => {
    config.licenseInfo = { ...config.licenseInfo, enabledFeatures: { ['reports.creation']: true } };
    contextSrv.user.permissions = {
      [AccessControlAction.ReportingCreate]: true,
    };
    initReporting();
    setup();

    expect(await screen.findByTestId(selector.scheduleReport)).toBeInTheDocument();
  });

  it('should not render schedule report menu item when feature not enabled', async () => {
    config.licenseInfo = { ...config.licenseInfo, enabledFeatures: { ['reports.creation']: false } };
    contextSrv.user.permissions = {
      [AccessControlAction.ReportingCreate]: true,
    };
    initReporting();
    setup();

    expect(screen.queryByTestId(selector.scheduleReport)).not.toBeInTheDocument();
  });

  it('should not render schedule report menu item when permission not granted', async () => {
    config.licenseInfo = { ...config.licenseInfo, enabledFeatures: { ['reports.creation']: true } };
    contextSrv.user.permissions = {
      [AccessControlAction.ReportingCreate]: false,
    };
    initReporting();
    setup();

    expect(screen.queryByTestId(selector.scheduleReport)).not.toBeInTheDocument();
  });
});

function setup(overrides?: Partial<DashboardSceneState>) {
  const panel = new VizPanel({
    title: 'Panel A',
    pluginId: 'table',
    key: 'panel-12',
  });

  const dashboard = new DashboardScene({
    title: 'hello',
    uid: 'dash-1',
    $timeRange: new SceneTimeRange({}),
    body: DefaultGridLayoutManager.fromVizPanels([panel]),
    ...overrides,
  });

  render(<ShareMenu dashboard={dashboard} />);
}
