import { useParams } from 'react-router-dom-v5-compat';

import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { getDataSourceLoadingNav } from 'app/features/datasources/state';
import { StoreState, useSelector } from 'app/types';

import { DataSourceInsightsUpgrade } from './DataSourceInsightsUpgrade';

export const DataSourceInsightsUpgradePage = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const dataSourceLoadingNav = getDataSourceLoadingNav('insights');
  const navIndex = useSelector((state: StoreState) => state.navIndex);
  const navModel = getNavModel(navIndex, `datasource-insights-${uid}`, dataSourceLoadingNav);

  return (
    <Page navId="datasources" pageNav={navModel.main}>
      <Page.Contents>
        <DataSourceInsightsUpgrade uid={uid} />
      </Page.Contents>
    </Page>
  );
};

export default DataSourceInsightsUpgradePage;
