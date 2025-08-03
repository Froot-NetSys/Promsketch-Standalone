import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { UpgradeBox, UpgradeContent, UpgradeContentProps } from 'app/core/components/Upgrade/UpgradeBox';

const ReportsUpgradePage = () => {
  const styles = useStyles2(getStyles);

  return (
    <Page
      navId="reports"
      subTitle="Manage automatically generated PDF reports from any dashboards and have Grafana email them to interested parties."
    >
      <div className={styles.box}>
        <UpgradeBox featureName={'reporting'} featureId={'reporting'} />
      </div>
      <Page.Contents className={styles.contents}>
        <ReportUpgradeContent />
      </Page.Contents>
      {/*Push down the page footer*/}
      <div className={styles.spacer} />
    </Page>
  );
};

export const ReportUpgradeContent = ({ action }: { action?: UpgradeContentProps['action'] }) => {
  return (
    <UpgradeContent
      featureName={'reporting'}
      description={
        'Reporting allows you to automatically generate PDFs from any of your dashboards and have Grafana email them to interested parties on a schedule.'
      }
      listItems={[
        'Customize your exact layout and orientation',
        'Personalize with your unique branding',
        'Specify permissions for users across your company',
        'Choose to send a report at custom intervals',
      ]}
      featureUrl={'https://grafana.com/docs/grafana/latest/enterprise/reporting/'}
      image={'reporting-email.png'}
      caption={
        'Create reports to share your SLO performance, business metrics, cost and utilization metrics or anything else you can express in a Grafana dashboard.'
      }
      action={action}
    />
  );
};
const getStyles = (theme: GrafanaTheme2) => {
  return {
    contents: css`
      &.page-body {
        flex: 0;
      }
    `,
    spacer: css`
      flex: 1;
    `,
    box: css`
      ${theme.breakpoints.up('sm')} {
        padding: ${theme.spacing(0, 1)};
      }

      ${theme.breakpoints.up('md')} {
        padding: ${theme.spacing(0, 2)};
      }
    `,
  };
};

export default ReportsUpgradePage;
