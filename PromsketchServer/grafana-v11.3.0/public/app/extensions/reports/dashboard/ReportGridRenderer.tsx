import { css } from '@emotion/css';
import { useResizeObserver } from '@react-aria/utils';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { GrafanaTheme2 } from '@grafana/data';
import { SceneGridItemLike, SceneGridLayout, SceneGridRow, SceneObject, SceneTimeRangeState } from '@grafana/scenes';
import { useTheme2 } from '@grafana/ui';
import { GRID_COLUMN_COUNT } from 'app/core/constants';
import { activateInActiveParents } from 'app/features/dashboard-scene/utils/utils';

import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';
import {
  buildGridLayout,
  buildSimpleLayout,
  calcGridItemPosition,
  getGridParams,
  PositionParams,
  ReportGridItem,
  ReportPage,
} from './utils';

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1122;
export const FOOTER = 10;
const SIDE_MARGIN = 16;

interface Props {
  grid: SceneGridLayout;
  dashboardTitle: string;
  timeRange: SceneTimeRangeState;
  variableControls?: SceneObject[];
}

export function ReportGridRenderer({ grid, dashboardTitle, timeRange, variableControls }: Props) {
  const [isActive, setIsActive] = useState(false);
  const { scaleFactor, isLandscape, isSimpleLayout, reportTitle, showTemplateVariables } = useUrlValues();
  const theme = useTheme2();
  const styles = getStyles(theme, scaleFactor);

  uncollapseRows(grid.state.children);
  const { children } = grid.useState();

  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const observedDiv = useRef<HTMLDivElement | null>(null);
  useResizeObserver({
    ref: observedDiv,
    onResize: () => {
      const element = observedDiv.current;
      if (element && element.offsetHeight !== 0) {
        setHeaderHeight(element.offsetHeight);
      }
    },
  });

  useEffect(() => {
    setIsActive(true);
    return activateInActiveParents(grid);
  }, [grid]);

  if (!isActive) {
    return null;
  }

  let pageWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
  let pageHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;

  const screenWidth = pageWidth * scaleFactor - 2 * SIDE_MARGIN;
  const screenHeight = (pageHeight - headerHeight - FOOTER) * scaleFactor;

  // this object can't be memoized because there are some references inside children that are being updated
  // when using repeating panels
  let blocks: ReportPage[] = [];
  if (isSimpleLayout) {
    blocks = buildSimpleLayout(children, scaleFactor, screenHeight, isLandscape);
  } else {
    blocks = buildGridLayout(children, scaleFactor, screenHeight);
  }

  return (
    <div>
      {/*This hidden ReportHeader is used to dynamically measure the height and then build the grid using that value*/}
      <div style={{ width: screenWidth, visibility: 'hidden', position: 'absolute', top: 0, left: 0 }}>
        <ReportHeader
          reportTitle={reportTitle || dashboardTitle}
          dashboardTitle={dashboardTitle}
          timeRange={timeRange}
          scaleFactor={scaleFactor}
          variableControls={variableControls}
          showTemplateVariables={showTemplateVariables}
          ref={observedDiv}
        />
      </div>
      <>
        {blocks.map((page, index) => (
          <div key={index} className={styles.page}>
            <div key={index} className={styles.content}>
              <ReportHeader
                reportTitle={reportTitle || dashboardTitle}
                dashboardTitle={dashboardTitle}
                timeRange={timeRange}
                scaleFactor={scaleFactor}
                variableControls={variableControls}
                showTemplateVariables={showTemplateVariables}
              />
              <div style={getPageStyle(page, screenWidth)}>
                {page.items.map((item, index) => (
                  <div key={index} style={getItemStyle(item, screenWidth)}>
                    {item.render()}
                  </div>
                ))}
              </div>
            </div>
            <ReportFooter scaleFactor={scaleFactor} currentPage={index + 1} totalPageCount={blocks.length} />
            {page.pageBreakAfter && <div style={{ pageBreakAfter: 'always' }} />}
          </div>
        ))}
      </>
    </div>
  );
}

export function useUrlValues() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const scaleFactor = parseFloat(urlParams.get('scale') ?? '');

  return {
    scaleFactor: isNaN(scaleFactor) ? 1 : scaleFactor,
    isLandscape: urlParams.get('pdf.landscape') !== 'false',
    isSimpleLayout: urlParams.get('pdf.layout') === 'simple',
    reportTitle: urlParams.get('title'),
    showTemplateVariables:
      urlParams.get('pdf.showTemplateVariables') !== null && urlParams.get('pdf.showTemplateVariables') !== 'false',
  };
}

function uncollapseRows(children: SceneGridItemLike[]) {
  for (const gridChild of children) {
    if (gridChild instanceof SceneGridRow && gridChild.state.isCollapsed) {
      gridChild.onCollapseToggle();
    }
  }
}

function getItemStyle(item: ReportGridItem, screenWidth: number): React.CSSProperties {
  const params: PositionParams = getGridParams(screenWidth);
  const position = calcGridItemPosition(params, item.x, item.y, item.w, item.h);

  return {
    top: position.top,
    left: position.left,
    width: position.width,
    height: position.height,
    position: 'absolute',
  };
}

function getPageStyle(block: ReportPage, screenWidth: number): React.CSSProperties {
  const params: PositionParams = getGridParams(screenWidth);
  const position = calcGridItemPosition(params, 0, 0, GRID_COLUMN_COUNT, block.h);

  return {
    width: position.width,
    height: position.height,
    position: 'relative',
  };
}

function getStyles(theme: GrafanaTheme2, scaleFactor: number) {
  return {
    page: css({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      minHeight: '100vh',
      // this is needed to avoid printing an extra empty page in the end
      '&:last-of-type': {
        marginBottom: theme.spacing(2 * -1),
      },
    }),
    content: css({
      flex: 1,
    }),
  };
}
