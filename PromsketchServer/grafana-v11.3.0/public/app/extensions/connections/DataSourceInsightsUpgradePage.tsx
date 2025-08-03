import { useParams } from 'react-router-dom-v5-compat';

import { Page } from 'app/core/components/Page/Page';
import { useDataSourceSettingsNav } from 'app/features/connections/hooks/useDataSourceSettingsNav';

import { DataSourceInsightsUpgrade } from '../meta-analytics/DataSourceInsights/DataSourceInsightsUpgrade';

export const DataSourceInsightsUpgradePage = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const { navId, pageNav } = useDataSourceSettingsNav('insights');

  return (
    <Page navId={navId} pageNav={pageNav}>
      <Page.Contents>
        <DataSourceInsightsUpgrade uid={uid} />
      </Page.Contents>
    </Page>
  );
};

export default DataSourceInsightsUpgradePage;
