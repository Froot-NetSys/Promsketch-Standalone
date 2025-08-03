import { useParams } from 'react-router-dom-v5-compat';

import { Page } from 'app/core/components/Page/Page';
import { useDataSourceSettingsNav } from 'app/features/connections/hooks/useDataSourceSettingsNav';

import Upgrade from '../permissions/Upgrade';

export const DataSourcePermissionsUpgradePage = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const { navId, pageNav } = useDataSourceSettingsNav('permissions');

  return (
    <Page navId={navId} pageNav={pageNav}>
      <Page.Contents>
        <Upgrade uid={uid} />
      </Page.Contents>
    </Page>
  );
};

export default DataSourcePermissionsUpgradePage;
