import { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { config } from '@grafana/runtime';
import { Stack } from '@grafana/ui';
import { Permissions } from 'app/core/components/AccessControl';
import { ResourcePermission } from 'app/core/components/AccessControl/types';
import { UpgradeBox } from 'app/core/components/Upgrade/UpgradeBox';
import { contextSrv } from 'app/core/core';
import { highlightTrial } from 'app/features/admin/utils';
import { useDataSourceRights } from 'app/features/datasources/state';
import { loadDataSource, loadDataSourceMeta, updateDataSource } from 'app/features/datasources/state/actions';

import { TeamLBACEditor } from '../teamLBAC/TeamLBACEditor';
import {
  addTeamLBACWarnings,
  getLBACTeamsConfigured,
  hasLBACSupport,
} from '../teamLBAC/utils';
import { AccessControlAction as EnterpriseActions, EnterpriseStoreState  } from '../types';

type ExternalProps = { uid: string };

function mapStateToProps(state: EnterpriseStoreState, props: ExternalProps) {
  const { uid } = props;
  return {
    resourceId: uid,
    dataSourceConfig: state.dataSources.dataSource,
    teamLBACConfig: state.teamLBAC?.teamLBACConfig,
  };
}

const mapDispatchToProps = {
  loadDataSource,
  loadDataSourceMeta,
  updateDataSource,
};

export const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector>;

// The RBAC version for data source permissions
const DataSourcePermissions = ({
  resourceId,
  dataSourceConfig,
  teamLBACConfig,
  loadDataSource,
  loadDataSourceMeta,
  updateDataSource,
}: Props) => {
  useEffect(() => {
    loadDataSource(resourceId);
  }, [resourceId, loadDataSource]);

  const canSetPermissions = contextSrv.hasPermissionInMetadata(
    EnterpriseActions.DataSourcesPermissionsWrite,
    dataSourceConfig
  );

  useEffect(() => {
    // Initialize DS metadata on page load to populate tab navigation
    loadDataSource(resourceId as any).then(loadDataSourceMeta);
  }, [loadDataSource, loadDataSourceMeta, resourceId]);

  const onTeamLBACUpdate = () => {
    loadDataSource(resourceId);
  };

  const getLBACWarnings = () => {
    return (items: ResourcePermission[]) => {
      if (!showTeamLBAC || !teamLBACConfig?.rules?.length) {
        return items;
      }
      const lbacTeamsConfigured = getLBACTeamsConfigured(teamLBACConfig?.rules);
      return addTeamLBACWarnings(lbacTeamsConfigured, items);
    };
  };

  const { readOnly, hasWriteRights } = useDataSourceRights(dataSourceConfig.uid);
  const showTeamLBAC = config.featureToggles.teamHttpHeaders && hasLBACSupport(dataSourceConfig);
  const readOnlyLBAC = readOnly || !canSetPermissions || !hasWriteRights;

  return (
    <Stack direction={'column'} gap={2}>
      {highlightTrial() && (
        <UpgradeBox
          featureId={'data-source-permissions'}
          eventVariant={'trial'}
          featureName={'data source permissions'}
          text={'Enable data source permissions for free during your trial of Grafana Pro.'}
        />
      )}
      <Permissions
        resource="datasources"
        resourceId={resourceId}
        canSetPermissions={canSetPermissions}
        getWarnings={showTeamLBAC ? getLBACWarnings() : undefined}
        epilogue={
          showTeamLBAC
            ? (items) => (
                <TeamLBACEditor
                  dataSourceConfig={dataSourceConfig}
                  readOnly={readOnlyLBAC}
                  onTeamLBACUpdate={onTeamLBACUpdate}
                  items={items}
                />
              )
            : undefined
        }
      />
    </Stack>
  );
};

export default connector(DataSourcePermissions);
