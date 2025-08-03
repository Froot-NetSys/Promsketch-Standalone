import { useTheme2 } from '@grafana/ui';
import { UpgradeBox, UpgradeContent } from 'app/core/components/Upgrade/UpgradeBox';
import { useInitDataSourceSettings } from 'app/features/datasources/state';

export type Props = {
  uid: string;
};

export const DataSourceInsightsUpgrade = ({ uid }: Props) => {
  useInitDataSourceSettings(uid);

  const theme = useTheme2();

  return (
    <>
      <UpgradeBox featureName={'data source usage insights'} featureId={'data-source-insights'} />
      <UpgradeContent
        listItems={[
          'Demonstrate and improve the value of your observability service by keeping track of user engagement',
          'Keep Grafana performant by identifying and fixing slow, error-prone data sources',
          'Clean up your instance by finding and removing unused data sources',
          'Review individual data source usage insights at a glance in the UI, sort search results by usage and errors, or dig into detailed usage logs',
        ]}
        image={`datasource-insights-${theme.isLight ? 'light' : 'dark'}.png`}
        featureName={'data source usage insights'}
        description={
          'Usage Insights provide detailed information about data source usage, like the number of views, queries, and errors users have experienced. You can use this to improve users’ experience and troubleshoot issues'
        }
        featureUrl={'https://grafana.com/docs/grafana/latest/enterprise/usage-insights/dashboard-datasource-insights'}
      />
    </>
  );
};
