import { locationUtil } from '@grafana/data';
import { featureEnabled, locationService, reportInteraction } from '@grafana/runtime';
import { ProBadge } from 'app/core/components/Upgrade/ProBadge';
import { config } from 'app/core/config';
import { t } from 'app/core/internationalization';
import { contextSrv } from 'app/core/services/context_srv';
import { highlightTrial } from 'app/features/admin/utils';
import { addDashboardShareTab, ShareModalTabModel } from 'app/features/dashboard/components/ShareModal';
import { shareDashboardType } from 'app/features/dashboard/components/ShareModal/utils';
import { DashboardScene } from 'app/features/dashboard-scene/scene/DashboardScene';
import {
  addDashboardExportDrawerItem,
  ExportDrawerMenuItem,
} from 'app/features/dashboard-scene/sharing/ExportButton/ExportMenu';
import {
  addDashboardShareDrawerItem,
  ShareDrawerMenuItem,
} from 'app/features/dashboard-scene/sharing/ShareButton/ShareMenu';
import { addDashboardShareView } from 'app/features/dashboard-scene/sharing/ShareDrawer/ShareDrawer';
import { addDashboardShareTab as addSceneDashboardShareTab } from 'app/features/dashboard-scene/sharing/ShareModal';

import { AccessControlAction, StepKey } from '../types';
import { buildExperimentID } from '../utils/featureHighlights';

import { CreateReportTab } from './CreateReportTab';
import Confirm from './ReportForm/Confirm';
import FormatReport from './ReportForm/FormatReport';
import Schedule from './ReportForm/Schedule';
import SelectDashboard from './ReportForm/SelectDashboard';
import Share from './ReportForm/Share';
import { SharePDF } from './SharePDF';
import { CreateReportTab as CreateReportTabScene } from './dashboard-scene/CreateReportTab';
import { SharePDFTab } from './dashboard-scene/SharePDFTab';
import { selectors } from './e2e-selectors/selectors';
import { getNewReportUrl } from './utils/url';

const highlightsEnabled = config.featureToggles.featureHighlights;
const shareButtonSelector = selectors.components.NewShareButton.Menu;

const sharePDFTab: ShareModalTabModel = {
  label: 'PDF',
  value: shareDashboardType.pdf,
  component: SharePDF,
};

const createReportTab: ShareModalTabModel = {
  label: 'Report',
  value: shareDashboardType.report,
  tabSuffix:
    (highlightsEnabled && !featureEnabled('reports.creation')) || highlightTrial()
      ? () => ProBadge({ experimentId: buildExperimentID('reporting-tab-badge') })
      : undefined,
  component: CreateReportTab,
};

export function initReporting() {
  if (!config.reporting?.enabled) {
    return;
  }

  const onReportClick = (dashboard: DashboardScene) => {
    const isReportsCreationEnabled = featureEnabled('reports.creation');

    if (isReportsCreationEnabled && !highlightTrial()) {
      reportInteraction('dashboards_sharing_report_create_clicked');
      const reportUrl = locationUtil.stripBaseFromUrl(`${config.appUrl}${getNewReportUrl(dashboard)}`);
      locationService.push(reportUrl);
    } else {
      locationService.partial({ shareView: shareDashboardType.report });
    }
  };

  const onExportAsPdfClick = () => {
    locationService.partial({ shareView: shareDashboardType.pdf });
  };

  const createReportMenuItem: ShareDrawerMenuItem = {
    shareId: shareDashboardType.report,
    testId: shareButtonSelector.scheduleReport,
    icon: 'clock-nine',
    label: t('share-dashboard.menu.schedule-report-title', 'Schedule report'),
    renderCondition: true,
    onClick: onReportClick,
  };

  const exportAsPdfMenuItem: ExportDrawerMenuItem = {
    shareId: shareDashboardType.pdf,
    testId: 'data-testid new export button export as pdf',
    icon: 'file-alt',
    label: t('share-dashboard.menu.export-pdf-title', 'Export as PDF'),
    renderCondition: true,
    onClick: onExportAsPdfClick,
  };

  if (featureEnabled('reports.creation')) {
    addDashboardShareTab(sharePDFTab);
    addSceneDashboardShareTab(SharePDFTab);
    addDashboardExportDrawerItem(exportAsPdfMenuItem);
    addDashboardShareView({ id: shareDashboardType.pdf, shareOption: SharePDFTab });

    if (contextSrv.hasPermission(AccessControlAction.ReportingCreate)) {
      addDashboardShareTab(createReportTab);
      addSceneDashboardShareTab(CreateReportTabScene);
      addDashboardShareView({ id: shareDashboardType.report, shareOption: CreateReportTabScene });
      addDashboardShareDrawerItem(createReportMenuItem);
    }
  } else if (highlightsEnabled) {
    addDashboardShareTab(createReportTab);
    addSceneDashboardShareTab(CreateReportTabScene);
    addDashboardShareDrawerItem(createReportMenuItem);
  }
}

export const reportSteps = [
  { id: StepKey.SelectDashboard, name: 'Select dashboard', component: SelectDashboard },
  { id: StepKey.FormatReport, name: 'Format report', component: FormatReport },
  { id: StepKey.Schedule, name: 'Schedule', component: Schedule },
  { id: StepKey.Share, name: 'Share', component: Share },
  { id: StepKey.Confirm, name: 'Confirm', component: Confirm },
];
