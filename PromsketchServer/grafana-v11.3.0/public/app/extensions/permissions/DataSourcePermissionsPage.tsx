import { useParams } from 'react-router-dom-v5-compat';

import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { getDataSourceLoadingNav } from 'app/features/datasources/state/navModel';
import { StoreState, useSelector } from 'app/types';

import DataSourcePermissions from './DataSourcePermissions';

// The RBAC version of the data source permissions page
export const DataSourcePermissionsPage = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const dataSourceLoadingNav = getDataSourceLoadingNav('permissions');
  const navIndex = useSelector((state: StoreState) => state.navIndex);
  const navModel = getNavModel(navIndex, `datasource-permissions-${uid}`, dataSourceLoadingNav);

  return (
    <Page navId="datasources" pageNav={navModel.main}>
      <Page.Contents>
        <DataSourcePermissions uid={uid} />
      </Page.Contents>
    </Page>
  );
};

export default DataSourcePermissionsPage;
