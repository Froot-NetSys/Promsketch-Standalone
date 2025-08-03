import { SceneGridItemLike, SceneGridRow, VizPanel } from '@grafana/scenes';

import { DashboardGridItem } from '../../../features/dashboard-scene/scene/DashboardGridItem';

import { A4_HEIGHT, FOOTER } from './ReportGridRenderer';
import { buildGridLayout } from './utils';

describe('buildGridLayout', () => {
  test('layout with large panels and rows', () => {
    const dashboardItems: SceneGridItemLike[] = [
      new DashboardGridItem({
        key: 'gridItem-1',
        x: 0,
        y: 0,
        height: 4,
        width: 24,
        body: new VizPanel({
          title: 'Top panel',
        }),
      }),
      new SceneGridRow({
        key: 'gridRow-1',
        title: 'First row',
        y: 4,
        children: [
          new DashboardGridItem({
            key: 'gridItem-2',
            x: 0,
            y: 5,
            height: 6,
            width: 12,
            body: new VizPanel({
              title: 'Panel A',
            }),
          }),
          new DashboardGridItem({
            key: 'gridItem-3',
            x: 12,
            y: 5,
            height: 6,
            width: 12,
            body: new VizPanel({
              title: 'Panel B',
            }),
          }),
        ],
      }),
      new SceneGridRow({
        key: 'gridRow-2',
        title: 'Second row',
        y: 11,
        children: [
          new DashboardGridItem({
            key: 'gridItem-4',
            x: 0,
            y: 12,
            height: 17,
            width: 24,
            body: new VizPanel({
              title: 'Large panel after row',
            }),
          }),
          new DashboardGridItem({
            key: 'gridItem-5',
            x: 0,
            y: 29,
            height: 24,
            width: 24,
            body: new VizPanel({
              title: 'Large panel after panel',
            }),
          }),
        ],
      }),
    ];
    const scale = 1.5;
    const pages = buildGridLayout(dashboardItems, scale, (A4_HEIGHT - 110 - FOOTER) * scale);

    expect(pages.length).toBe(3);
    expect(pages[0].items.length).toBe(4);
    expect(pages[1].items.length).toBe(2);
    expect(pages[2].items.length).toBe(1);
  });
});
