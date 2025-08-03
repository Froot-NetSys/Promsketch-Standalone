import { useParams } from 'react-router-dom-v5-compat';

import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { getDataSourceLoadingNav } from 'app/features/datasources/state';
import { StoreState, useSelector } from 'app/types';

import Upgrade from './Upgrade';

export const UpgradePage = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const dataSourceLoadingNav = getDataSourceLoadingNav('permissions');
  const navIndex = useSelector((state: StoreState) => state.navIndex);
  const navModel = getNavModel(navIndex, `datasource-permissions-${uid}`, dataSourceLoadingNav);

  return (
    <Page navId="datasources" pageNav={navModel.main}>
      <Page.Contents>
        <Upgrade uid={uid} />
      </Page.Contents>
    </Page>
  );
};

export default UpgradePage;
