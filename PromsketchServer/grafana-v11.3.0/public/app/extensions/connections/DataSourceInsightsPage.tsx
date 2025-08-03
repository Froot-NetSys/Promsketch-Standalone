import { useParams } from 'react-router-dom-v5-compat';

import { Page } from 'app/core/components/Page/Page';
import { useDataSourceSettingsNav } from 'app/features/connections/hooks/useDataSourceSettingsNav';

import DataSourceInsights from '../meta-analytics/DataSourceInsights/DataSourceInsights';

export const DataSourceInsightsPage = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const { navId, pageNav } = useDataSourceSettingsNav('insights');

  return (
    <Page navId={navId} pageNav={pageNav}>
      <Page.Contents>
        <DataSourceInsights uid={uid} />
      </Page.Contents>
    </Page>
  );
};

export default DataSourceInsightsPage;
