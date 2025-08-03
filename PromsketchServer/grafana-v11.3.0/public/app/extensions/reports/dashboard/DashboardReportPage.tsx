// Libraries
import { css } from '@emotion/css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { GrafanaTheme2 } from '@grafana/data';
import { UrlSyncContextProvider } from '@grafana/scenes';
import { Alert, useStyles2 } from '@grafana/ui';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { DashboardPageRouteParams } from 'app/features/dashboard/containers/types';
import { getDashboardScenePageStateManager } from 'app/features/dashboard-scene/pages/DashboardScenePageStateManager';
import { DashboardScene } from 'app/features/dashboard-scene/scene/DashboardScene';
import { DefaultGridLayoutManager } from 'app/features/dashboard-scene/scene/layout-default/DefaultGridLayoutManager';
import { DashboardRoutes } from 'app/types';

import { ReportGridRenderer } from './ReportGridRenderer';

export interface Props extends GrafanaRouteComponentProps<DashboardPageRouteParams> {}

export function DashboardReportPage({ route }: Props) {
  const stateManager = getDashboardScenePageStateManager();
  const { dashboard, isLoading, loadError } = stateManager.useState();
  const { uid = '' } = useParams();

  useEffect(() => {
    stateManager.loadDashboard({ uid, route: DashboardRoutes.Report });

    return () => {
      stateManager.clearState();
    };
  }, [stateManager, uid, route.routeName]);

  if (!dashboard) {
    return (
      <div>
        {isLoading && <PageLoader />}
        {loadError && <h2>{loadError}</h2>}
      </div>
    );
  }

  return <DashbordReportRenderer model={dashboard} />;
}

interface RendererProps {
  model: DashboardScene;
}

function DashbordReportRenderer({ model }: RendererProps) {
  const [isActive, setIsActive] = useState(false);
  const dashboard = model.useState();
  const timeRange = dashboard.$timeRange!.useState();
  const variableControls = dashboard.controls?.useState().variableControls;

  const styles = useStyles2(getStyles);
  useEffect(() => {
    setIsActive(true);
    return model.activate();
  }, [model]);

  if (!isActive) {
    return null;
  }

  const layout = dashboard.body;
  if (!(layout instanceof DefaultGridLayoutManager)) {
    return <Alert title="Unsupported dashboard layout" severity="error" />;
  }

  return (
    <UrlSyncContextProvider scene={model}>
      <div className={styles.canvas}>
        <div className={styles.body}>
          <ReportGridRenderer grid={layout.state.grid} dashboardTitle={dashboard.title} timeRange={timeRange} variableControls={variableControls}/>
        </div>
      </div>
    </UrlSyncContextProvider>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    canvas: css({
      label: 'canvas',
      display: 'flex',
      flexDirection: 'column',
      flexBasis: '100%',
      flexGrow: 1,
      padding: '0 ' + theme.spacing(2),
    }),
    body: css({
      label: 'body',
      flexGrow: 1,
      display: 'flex',
      gap: '8px',
      marginBottom: theme.spacing(2),
    }),
  };
}

export default DashboardReportPage;
