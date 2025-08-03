import { config } from '@grafana/runtime';
import { SceneComponentProps, SceneObjectBase } from '@grafana/scenes';
import { t } from 'app/core/internationalization';
import { shareDashboardType } from 'app/features/dashboard/components/ShareModal/utils';
import { SceneShareTabState, ShareView } from 'app/features/dashboard-scene/sharing/types';
import { getDashboardSceneFor } from 'app/features/dashboard-scene/utils/utils';

import { CreateReportTab as CreateReportTabBase } from '../../reports/CreateReportTab';

export class CreateReportTab extends SceneObjectBase<SceneShareTabState> implements ShareView {
  public tabId = shareDashboardType.report;
  static Component = CreateReportTabRenderer;

  public getTabLabel() {
    return config.featureToggles.newDashboardSharingComponent
      ? t('share-dashboard.menu.schedule-report-title', 'Schedule report')
      : 'Report';
  }
}

function CreateReportTabRenderer({ model }: SceneComponentProps<CreateReportTab>) {
  const { modalRef } = model.useState();
  const dashboard = getDashboardSceneFor(model);

  return (
    <CreateReportTabBase
      dashboard={dashboard}
      onDismiss={() => {
        modalRef?.resolve()?.onDismiss();
      }}
    />
  );
}
