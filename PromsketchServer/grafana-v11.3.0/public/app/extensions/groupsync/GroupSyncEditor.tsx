import { cloneDeep, isEmpty } from 'lodash';
import { useState, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Column, FilterInput, InteractiveTable, Button, Pagination, Stack, ConfirmModal } from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { Page } from 'app/core/components/Page/Page';
import { RolePicker } from 'app/core/components/RolePicker/RolePicker';
import { useMultiOrgRoleOptions } from 'app/core/components/RolePicker/hooks';
import { Role, StoreState } from 'app/types';

import { GroupSyncEmptyState } from './EmptyState';
import { NewMappingForm } from './NewMappingForm';
import { deleteGroup, putGroup, useGroupSyncList } from './api';
import type { Group, GroupAttrs, GroupSyncListAPI } from './types';

interface TableDataItem {
  groupID: string;
  orgID: number;
  roles: string[];
}

function groupsToTableItems(groups: Group[]): TableDataItem[] {
  const items: TableDataItem[] = [];
  for (const group of groups) {
    for (const [orgID, attrs] of Object.entries(group.mappings)) {
      items.push({
        groupID: group.groupID,
        orgID: parseInt(orgID, 10),
        roles: attrs.roles,
      });
    }
  }
  return items;
}

function getUniqueOrgIDs(tableData: TableDataItem[]): number[] {
  const orgIDs = new Set<number>();
  tableData.forEach((item) => orgIDs.add(item.orgID));
  return Array.from(orgIDs);
}

type ActionBarProps = {
  groupsList: GroupSyncListAPI;
  singleOrg: boolean;
};

function ActionBar({ groupsList }: ActionBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Stack direction="column" gap={2}>
      <Stack justifyContent="space-between">
        <Stack gap={1}>
          <FilterInput
            value={groupsList.filters.groupID}
            onChange={groupsList.setGroupIDFilter}
            placeholder="Search by group ID"
            width={60}
          />
        </Stack>
        <Button onClick={() => setDrawerOpen(!drawerOpen)}>{drawerOpen ? 'Close' : 'New'}</Button>
      </Stack>
      <SlideDown in={drawerOpen}>
        <div className="cta-form" style={{ marginBottom: 0 }}>
          <Stack direction="column" gap={1}>
            <h5>New group mapping</h5>
            {drawerOpen && <NewMappingForm onSave={() => groupsList.refresh(true)} />}
          </Stack>
        </div>
      </SlideDown>
    </Stack>
  );
}

function GroupSyncEditor({ userOrgs }: Props) {
  const [deleteGroupID, setDeleteGroupID] = useState('');
  const groupsList = useGroupSyncList(1, {
    groupID: '',
  });
  const tableData = groupsToTableItems(groupsList.groups);
  const orgIDs = getUniqueOrgIDs(tableData);
  if (orgIDs.length === 0) {
    orgIDs.push(1);
  }
  const roleOptions = useMultiOrgRoleOptions(orgIDs);
  const singleOrg = userOrgs.length === 1;

  function handleDelete() {
    deleteGroup(deleteGroupID)
      .then(() => {
        groupsList.refresh(false);
      })
      .finally(() => {
        setDeleteGroupID('');
      });
  }

  const cols: Array<Column<TableDataItem>> = useMemo(
    () => [
      {
        id: 'groupID',
        header: 'Group',
        cell: ({ cell }) => <code>{cell.value}</code>,
      },
      {
        id: 'roles',
        header: 'Roles',
        cell: ({ cell }) => {
          const { orgID, groupID } = cell.row.original;
          const orgRoleOptions = roleOptions[cell.row.original.orgID] || [];
          const onRolesChange = (newRoles: Role[]) => {
            const existingGroup = groupsList.groups.find((group) => group.groupID === groupID);
            if (existingGroup === undefined) {
              throw new Error('expected groupsList to contain table item');
            }
            const updated = cloneDeep(existingGroup);
            const newAttrs: GroupAttrs = {
              ...updated.mappings[orgID],
              roles: newRoles.map((role) => role.uid),
            };
            putGroup(groupID, newAttrs);
          };
          return (
            <RolePicker
              appliedRoles={orgRoleOptions.filter((role) => cell.row.original.roles.includes(role.uid))}
              onRolesChange={onRolesChange}
              roleOptions={orgRoleOptions}
              basicRoleDisabled={true}
              apply
              canUpdateRoles
            />
          );
        },
      },
      {
        id: 'delete',
        header: '',
        cell: ({ cell }) => (
          <Stack justifyContent="end">
            <Button
              variant="secondary"
              onClick={() => setDeleteGroupID(cell.row.original.groupID)}
              icon="trash-alt"
              aria-label={`Delete group mapping`}
            />
          </Stack>
        ),
      },
    ],
    [groupsList, roleOptions]
  );

  return (
    <Page navId="groupsync">
      <ConfirmModal
        isOpen={!isEmpty(deleteGroupID)}
        title="Delete group mappings"
        body="Are you sure you want to delete all mappings for this group?"
        confirmText="Delete"
        onConfirm={handleDelete}
        onDismiss={() => setDeleteGroupID('')}
      />
      <Page.Contents isLoading={groupsList.loading && !groupsList.initialized}>
        <Stack direction="column" gap={1}>
          <ActionBar groupsList={groupsList} singleOrg={singleOrg} />
          {groupsList.initialized && groupsList.groups.length > 0 ? (
            <InteractiveTable
              columns={cols}
              data={tableData}
              getRowId={(originalRow) => `${originalRow.orgID}/${originalRow.groupID}`}
            />
          ) : (
            <GroupSyncEmptyState />
          )}
          {groupsList.total > 50 && (
            <Stack justifyContent="end">
              <Pagination
                currentPage={groupsList.page}
                numberOfPages={Math.ceil(groupsList.total / 50)}
                onNavigate={(p) => {
                  groupsList.setPage(p);
                }}
              />
            </Stack>
          )}
        </Stack>
      </Page.Contents>
    </Page>
  );
}

const mapStateToProps = (state: StoreState) => {
  return {
    userOrgs: state.organization.userOrgs,
  };
};
const connector = connect(mapStateToProps, {});
type Props = ConnectedProps<typeof connector>;

export default connector(GroupSyncEditor);
