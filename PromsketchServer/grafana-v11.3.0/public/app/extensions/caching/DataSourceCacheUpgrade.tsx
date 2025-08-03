import { UpgradeBox } from 'app/core/components/Upgrade/UpgradeBox';
import { useInitDataSourceSettings } from 'app/features/datasources/state';

import { DataSourceCacheUpgradeContent } from './DataSourceCache';

export type Props = {
  uid: string;
};

export const DataSourceCacheUpgrade = ({ uid }: Props) => {
  useInitDataSourceSettings(uid);

  return (
    <>
      <UpgradeBox featureName={'query caching'} featureId={'query-caching'} />
      <DataSourceCacheUpgradeContent />
    </>
  );
};
