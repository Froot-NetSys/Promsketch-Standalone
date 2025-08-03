import { useParams } from 'react-router-dom-v5-compat';

import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { getDataSourceLoadingNav } from 'app/features/datasources/state/navModel';
import { StoreState, useSelector } from 'app/types';

import DataSourceCache from './DataSourceCache';

export const DataSourceCachePage = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const dataSourceLoadingNav = getDataSourceLoadingNav('cache');
  const navIndex = useSelector((state: StoreState) => state.navIndex);
  const navModel = getNavModel(navIndex, `datasource-cache-${uid}`, dataSourceLoadingNav);

  return (
    <Page navId="datasources" pageNav={navModel.main}>
      <Page.Contents>
        <DataSourceCache uid={uid} />
      </Page.Contents>
    </Page>
  );
};

export default DataSourceCachePage;
