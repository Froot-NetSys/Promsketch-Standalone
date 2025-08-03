import { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { config, featureEnabled, reportExperimentView, reportInteraction } from '@grafana/runtime';
import { Drawer, ToolbarButton, useTheme2 } from '@grafana/ui';
import { UpgradeBox, UpgradeContentVertical } from 'app/core/components/Upgrade/UpgradeBox';
import { contextSrv } from 'app/core/core';
import { highlightTrial } from 'app/features/admin/utils';
import { addCustomRightAction } from 'app/features/dashboard/components/DashNav/DashNav';
import { DashboardModel } from 'app/features/dashboard/state';

import { AccessControlAction, EnterpriseStoreState } from '../../types';
import { buildExperimentID, ExperimentGroup } from '../../utils/featureHighlights';
import { setDrawerOpen } from '../state/reducers';

import AnalyticsDrawer from './AnalyticsDrawer';

type AnalyticsToolbarButtonProps = {
  onClick(): void;
  isHighlighted?: boolean;
};

const AnalyticsToolbarButton = ({ onClick, isHighlighted }: AnalyticsToolbarButtonProps) => {
  return (
    <ToolbarButton icon="info-circle" tooltip="Dashboard insights" onClick={onClick} isHighlighted={isHighlighted} />
  );
};

type AnalyticsContentProps = {
  dashboard?: DashboardModel;
  isDrawerOpen: boolean;
  setDrawerOpen: typeof setDrawerOpen;
};

const AnalyticsContent: FC<AnalyticsContentProps> = ({ dashboard, isDrawerOpen, setDrawerOpen }) => {
  const showContent = dashboard?.id && dashboard.meta.url;
  const showHighlight = highlightTrial();

  useEffect(() => {
    if (showContent && showHighlight) {
      reportExperimentView(buildExperimentID('dashboard-insights-dot'), ExperimentGroup.Test, 'trial');
    }
  }, [showContent, showHighlight]);

  return (
    showContent && (
      <>
        <AnalyticsToolbarButton
          onClick={() => {
            setDrawerOpen(true);
            reportInteraction('dashboards_toolbar_actions_clicked', { item: 'insights' });
          }}
          isHighlighted={showHighlight}
        />
        {isDrawerOpen && <AnalyticsDrawer dashboard={dashboard} />}
      </>
    )
  );
};

function mapStateToProps(state: EnterpriseStoreState) {
  return {
    isDrawerOpen: state.metaAnalytics.isDrawerOpen,
  };
}

const mapDispatchToProps = {
  setDrawerOpen,
};

type AnalyticsContentUpgradeProps = {
  dashboard?: DashboardModel;
};

const AnalyticsContentUpgrade = ({ dashboard }: AnalyticsContentUpgradeProps) => {
  const showContent = dashboard?.id && dashboard.meta.url;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (showContent) {
      reportExperimentView(buildExperimentID('dashboard-insights-dot'), ExperimentGroup.Test, '');
    }
  }, [showContent]);

  return (
    showContent && (
      <>
        <AnalyticsToolbarButton
          isHighlighted
          onClick={() => {
            setIsDrawerOpen(true);
          }}
        />
        {isDrawerOpen && <AnalyticsUpgradeDrawer dashboard={dashboard} onClose={() => setIsDrawerOpen(false)} />}
      </>
    )
  );
};

export const initAnalyticsDrawer = () => {
  if (featureEnabled('analytics')) {
    if (contextSrv.hasPermission(AccessControlAction.DashboardsInsightsRead)) {
      addCustomRightAction({
        show: () => true,
        component: connect(mapStateToProps, mapDispatchToProps)(AnalyticsContent),
        index: -1,
      });
    }
  } else if (config.featureToggles.featureHighlights) {
    addCustomRightAction({
      show: () => true,
      component: AnalyticsContentUpgrade,
      index: -1,
    });
  }
};

interface AnalyticsUpgradeDrawerProps {
  onClose: () => void;
}

export const AnalyticsUpgradeDrawer = ({
  onClose,
  dashboard,
}: AnalyticsUpgradeDrawerProps & AnalyticsContentUpgradeProps) => {
  const theme = useTheme2();

  return (
    <Drawer onClose={onClose} title={`${dashboard?.title} - analytics`} width={'50%'}>
      <UpgradeBox featureName={'dashboard usage insights'} featureId={'dashboard-insights'} />
      <UpgradeContentVertical
        featureName={'dashboard usage insights'}
        image={`usage-insights-${theme.isLight ? 'light' : 'dark'}.png`}
        featureUrl={'https://grafana.com/docs/grafana/latest/enterprise/usage-insights/dashboard-datasource-insights'}
        description={
          'Usage Insights provide detailed information about dashboard usage, like the number of views, queries, and errors users have experienced. You can use this to improve users’ experience and troubleshoot issues.'
        }
      />
    </Drawer>
  );
};
