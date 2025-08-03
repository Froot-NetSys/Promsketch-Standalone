import { useParams } from 'react-router-dom-v5-compat';

import { Page } from 'app/core/components/Page/Page';
import { useDataSourceSettingsNav } from 'app/features/connections/hooks/useDataSourceSettingsNav';

import { DataSourceCacheUpgrade } from '../caching/DataSourceCacheUpgrade';

export const DataSourceCacheUpgradePage = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const { navId, pageNav } = useDataSourceSettingsNav('cache');

  return (
    <Page navId={navId} pageNav={pageNav}>
      <Page.Contents>
        <DataSourceCacheUpgrade uid={uid} />
      </Page.Contents>
    </Page>
  );
};

export default DataSourceCacheUpgradePage;
