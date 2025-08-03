import { cloneDeep, isEqual } from 'lodash';
import { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';

import { getBackendSrv } from '@grafana/runtime';

import type { Group, GroupFilters, GetGroupsResponse, GroupSyncListAPI, GroupSyncWriterAPI, GroupAttrs } from './types';

const PageSize = 50;

export function fetchGroupSyncGroups(page: number, perPage: number, filters: GroupFilters): Promise<GetGroupsResponse> {
  const params: Record<string, any> = {
    page,
    perPage,
  };
  if (typeof filters.groupID === 'string' && filters.groupID.trim().length > 0) {
    params.groupID = filters.groupID;
  }
  return getBackendSrv().get('/api/groupsync/groups', params);
}

export async function createGroup(groupID: string, attrs: GroupAttrs): Promise<void> {
  await getBackendSrv().post(`/api/groupsync/groups/${groupID}`, attrs);
}

/**
 * Put the group.
 *
 * @param orgID number
 * @param group Group
 */
export async function putGroup(groupID: string, attrs: GroupAttrs): Promise<void> {
  await getBackendSrv().put(`/api/groupsync/groups/${groupID}`, attrs);
}

export async function deleteGroup(groupID: string): Promise<void> {
  await getBackendSrv().delete(`/api/groupsync/groups/${groupID}`);
}

/**
 * useGroupSyncList tracks state for reading Groups from groupsync.
 *
 * @param initPage initial page to load
 * @param initFilters initial filters to apply
 * @returns
 */
export function useGroupSyncList(initPage: number, initFilters: GroupFilters): GroupSyncListAPI {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initPage);
  const [filters, setFilters] = useState(initFilters);

  useAsync(async () => {
    setLoading(true);
    const resp = await fetchGroupSyncGroups(page, PageSize, filters);
    setGroups(resp.groups);
    setTotal(resp.total);
    setLoading(false);
    if (!initialized) {
      setInitialized(true);
    }
  }, [page, filters]);

  function setGroupIDFilter(newValue: string) {
    setFilters({ ...filters, groupID: newValue });
  }

  async function refresh(reset: boolean) {
    let currentPage = page;
    if (reset) {
      setPage(1);
      currentPage = 1;
    }
    setLoading(true);
    const resp = await fetchGroupSyncGroups(currentPage, PageSize, filters);
    setGroups(resp.groups);
    setTotal(resp.total);
    setLoading(false);
  }

  return {
    groups,
    loading,
    initialized,
    total,
    page,
    setPage,
    filters,
    setGroupIDFilter,
    refresh,
  };
}

const InitGroup: Group = {
  groupID: '',
  mappings: {},
};

/**
 * useGroupSyncWriter tracks state for a write operation on a Group.
 *
 * @param initGroup initial group values. Omit for new groups; provide a group entity when performing an update.
 * @returns GroupSyncWriterAPI
 */
export function useGroupSyncWriter(initGroup: Group = InitGroup): GroupSyncWriterAPI {
  const [group, setGroup] = useState(initGroup);

  return {
    group,
    setGroupID: (value: string) => {
      setGroup({ ...group, groupID: value });
    },
    setRoles: (orgID: number, roleUIDs: string[]) => {
      setGroup((prev) => {
        const newMappings = cloneDeep(prev.mappings);
        if (newMappings[orgID] === undefined) {
          newMappings[orgID] = {
            roles: roleUIDs,
          };
        } else {
          newMappings[orgID].roles = roleUIDs;
        }
        return {
          ...prev,
          mappings: newMappings,
        };
      });
    },
    canSave: (): boolean => {
      // groupID must not be empty
      if (group.groupID.length === 0) {
        return false;
      }
      // there must be changes to the mappings
      if (isEqual(group.mappings, initGroup.mappings)) {
        return false;
      }
      return true;
    },
    save: (orgID: number) => {
      if (initGroup.groupID === '') {
        return createGroup(group.groupID, group.mappings[orgID]);
      } else {
        return putGroup(group.groupID, group.mappings[orgID]);
      }
    },
    reset: () => {
      setGroup(InitGroup);
    },
  };
}
