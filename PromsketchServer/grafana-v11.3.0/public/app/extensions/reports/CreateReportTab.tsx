import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { featureEnabled, reportInteraction } from '@grafana/runtime';
import { LinkButton, useStyles2 } from '@grafana/ui';
import { UpgradeBox, UpgradeContentVertical } from 'app/core/components/Upgrade/UpgradeBox';
import { highlightTrial } from 'app/features/admin/utils';
import { ShareModalTabProps } from 'app/features/dashboard/components/ShareModal';
import { DashboardModel } from 'app/features/dashboard/state/DashboardModel';
import { DashboardScene } from 'app/features/dashboard-scene/scene/DashboardScene';

import { getNewReportUrl } from './utils/url';

interface Props extends Omit<ShareModalTabProps, 'dashboard'> {
  dashboard: DashboardModel | DashboardScene;
}
export const CreateReportTab = ({ dashboard, onDismiss }: Props) => {
  const styles = useStyles2(getStyles);
  const isReportsCreationDisabled = !featureEnabled('reports.creation');

  function onClickCreateReport() {
    reportInteraction('dashboards_sharing_report_create_clicked');
    onDismiss && onDismiss();
  }

  if (isReportsCreationDisabled) {
    return (
      <div className={styles.container}>
        <UpgradeBox featureName={'reporting'} featureId={'reporting-tab'} />
        <UpgradeContentVertical
          image={'reporting-email.png'}
          featureName={'reporting'}
          featureUrl={'https://grafana.com/docs/grafana/latest/enterprise/reporting'}
          description={
            'Reporting allows you to automatically generate PDFs from any of your dashboards and have Grafana email them to interested parties on a schedule.'
          }
        />
      </div>
    );
  }

  return (
    <>
      {highlightTrial() && (
        <div className={styles.highlight}>
          <UpgradeBox
            featureId={'reporting-tab'}
            eventVariant={'trial'}
            featureName={'reporting'}
            text={'Create unlimited reports during your trial of Grafana Pro.'}
          />
          <h3>Get started with reporting</h3>
          <h6>
            Reporting allows you to automatically generate PDFs from any of your dashboards and have Grafana email them
            to interested parties on a schedule.
          </h6>
        </div>
      )}
      <LinkButton href={getNewReportUrl(dashboard)} onClick={onClickCreateReport} className={styles.button}>
        Create report using this dashboard
      </LinkButton>
      {highlightTrial() && (
        <LinkButton fill="text" href={'https://grafana.com/docs/grafana/latest/enterprise/reporting'}>
          Learn more
        </LinkButton>
      )}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    `,
    button: css`
      margin-right: ${theme.spacing(2)};
    `,
    highlight: css`
      margin-bottom: ${theme.spacing(3)};

      h6 {
        font-weight: ${theme.typography.fontWeightLight};
      }
    `,
  };
};
