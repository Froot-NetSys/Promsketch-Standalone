export type Group = {
  groupID: string;
  mappings: Record<number, GroupAttrs>;
};

export type GroupAttrs = {
  roles: string[];
};

export type GroupFilters = {
  groupID: string;
};

export type GetGroupsResponse = {
  groups: Group[];
  total: number;
};

/**
 * GroupSyncListAPI is an interface for using a paginated and filtered list of groups.
 * Check `useGroupSyncList(..)` for usage in a React component.
 */
export interface GroupSyncListAPI {
  /** Current group list */
  groups: Group[];
  /** Whether the groups are loading */
  loading: boolean;
  /** Whether the first request for groups has finished. Is only set once after the first list of groups retrieved. */
  initialized: boolean;
  /** Total records for paging */
  total: number;
  /** Current page */
  page: number;
  /** Set the paging */
  setPage: (p: number) => void;
  /** Current filters */
  filters: GroupFilters;
  /** Set the groupID filter (search by group ID) */
  setGroupIDFilter: (v: string) => void;
  /** Refresh the group list from the backend */
  refresh: (reset: boolean) => Promise<void>;
}

/**
 * GroupSyncWriterAPI is an interface for operating on the state of a `Group` entity.
 * Check `useGroupSyncWriter(..)` for usage in a React component.
 */
export interface GroupSyncWriterAPI {
  /** Current group state */
  group: Group;
  /** Set the group ID value. Should not be called for updates to existing group mappings. */
  setGroupID: (value: string) => void;
  /** Set the mapped roles for a given org */
  setRoles: (orgID: number, roleUIDs: string[]) => void;
  /** Persist the new or updated group for a given orgID. Must call multiple times if saving multi-org changes to a group. */
  save: (orgID: number) => Promise<void>;
  /** Check that the group is valid and can be saved */
  canSave: () => boolean;
  /** Restore the local state to its initial values */
  reset: () => void;
}
