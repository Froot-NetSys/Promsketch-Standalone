import { DataSourcePermission } from '../../types';

export const getMockDataSourcePermissionsUser = (): DataSourcePermission => {
  return {
    created: '2018-10-10T16:50:45+02:00',
    datasourceId: 1,
    id: 2,
    permission: 1,
    permissionName: 'Query',
    updated: '2018-10-10T16:50:45+02:00',
    userAvatarUrl: '/avatar/926aa85c6bcefa0b4deca3223f337ae1',
    userEmail: 'test@test.com',
    userId: 3,
    userLogin: 'testUser',
  };
};

export const getMockDataSourcePermissionsTeam = (): DataSourcePermission => {
  return {
    created: '2018-10-10T16:57:09+02:00',
    datasourceId: 1,
    id: 6,
    permission: 1,
    permissionName: 'Query',
    team: 'A-team',
    teamAvatarUrl: '/avatar/93c0801b955cbd443a8cfa91a401d7bc',
    teamId: 1,
    updated: '2018-10-10T16:57:09+02:00',
  };
};
