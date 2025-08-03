import { useMemo } from 'react';

import { config } from '@grafana/runtime';
import { SceneComponentProps, sceneGraph, SceneObjectBase } from '@grafana/scenes';
import { t } from '@grafana/ui/src/utils/i18n';
import { shareDashboardType } from 'app/features/dashboard/components/ShareModal/utils';
import { SceneShareTabState } from 'app/features/dashboard-scene/sharing/types';
import { getDashboardSceneFor } from 'app/features/dashboard-scene/utils/utils';

import { SharePDFBase } from '../SharePDF';
import { toReportSceneVariables } from '../utils/variables';

export class SharePDFTab extends SceneObjectBase<SceneShareTabState> {
  public tabId = shareDashboardType.pdf;
  static Component = SharePDFTabRenderer;

  public getTabLabel() {
    return config.featureToggles.newDashboardSharingComponent ? t('export.pdf.title', 'Export dashboard PDF') : 'PDF';
  }
}

function SharePDFTabRenderer({ model }: SceneComponentProps<SharePDFTab>) {
  const { modalRef, onDismiss } = model.useState();
  const dashboard = getDashboardSceneFor(model);

  const variables = useMemo(() => {
    const sceneGraphVars = sceneGraph.getVariables(dashboard).state.variables;
    return toReportSceneVariables(sceneGraphVars);
  }, [dashboard]);

  return (
    <SharePDFBase
      onDismiss={() => {
        modalRef ? modalRef.resolve().onDismiss() : onDismiss?.();
      }}
      displayQueryVariablesAlert={false}
      variables={variables}
      dashboardUid={dashboard.state.uid!}
    />
  );
}
