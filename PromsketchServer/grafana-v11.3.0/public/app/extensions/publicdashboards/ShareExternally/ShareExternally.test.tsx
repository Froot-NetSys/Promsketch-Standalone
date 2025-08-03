import { screen } from '@testing-library/react';
import { render } from 'test/test-utils';

import { getPanelPlugin } from '@grafana/data/test/__mocks__/pluginMocks';
import { selectors as e2eSelectors } from '@grafana/e2e-selectors';
import { setPluginImportUtils } from '@grafana/runtime';
import { SceneTimeRange, VizPanel } from '@grafana/scenes';
import { isEmailSharingEnabled } from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/SharePublicDashboardUtils';
import { DefaultGridLayoutManager } from 'app/features/dashboard-scene/scene/layout-default/DefaultGridLayoutManager';

import { shareDashboardType } from '../../../features/dashboard/components/ShareModal/utils';
import { DashboardScene } from '../../../features/dashboard-scene/scene/DashboardScene';
import { ShareDrawer } from '../../../features/dashboard-scene/sharing/ShareDrawer/ShareDrawer';
import { activateFullSceneTree } from '../../../features/dashboard-scene/utils/test-utils';

const selectors = e2eSelectors.pages.ShareDashboardDrawer.ShareExternally;

setPluginImportUtils({
  importPanelPlugin: (id: string) => Promise.resolve(getPanelPlugin({})),
  getPanelPluginFromCache: (id: string) => undefined,
});

jest.mock('app/features/dashboard/components/ShareModal/SharePublicDashboard/SharePublicDashboardUtils', () => ({
  isEmailSharingEnabled: jest.fn(),
  PublicDashboardShareType: {
    PUBLIC: 'public',
    EMAIL: 'email',
  },
}));

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ShareExternally', () => {
  it('renders share type select when email sharing is enabled', async () => {
    jest.mocked(isEmailSharingEnabled).mockReturnValue(true);
    await buildAndRenderScenario();

    expect(await screen.findByTestId(selectors.shareTypeSelect)).toBeInTheDocument();
  });

  it('does not render share type select when email sharing is disabled', async () => {
    jest.mocked(isEmailSharingEnabled).mockReturnValue(false);
    await buildAndRenderScenario();

    expect(screen.queryByTestId(selectors.shareTypeSelect)).not.toBeInTheDocument();
  });
});

async function buildAndRenderScenario() {
  const drawer = new ShareDrawer({
    shareView: shareDashboardType.publicDashboard,
  });

  const dashboard = new DashboardScene({
    title: 'hello',
    uid: 'dash-1',
    meta: {
      canEdit: true,
    },
    $timeRange: new SceneTimeRange({}),
    body: DefaultGridLayoutManager.fromVizPanels([
      new VizPanel({
        title: 'Panel A',
        pluginId: 'table',
        key: 'panel-12',
      }),
    ]),
    overlay: drawer,
  });

  drawer.activate();
  activateFullSceneTree(dashboard);

  render(<drawer.Component model={drawer} />);

  return { dashboard, drawer };
}
