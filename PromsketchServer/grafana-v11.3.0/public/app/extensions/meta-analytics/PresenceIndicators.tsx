import { isEqual } from 'lodash';
import { FC, useState, useEffect } from 'react';
import * as React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { UsersIndicator } from '@grafana/ui/src/components/UsersIndicator/UsersIndicator';
import { contextSrv } from 'app/core/services/context_srv';
import { addCustomLeftAction } from 'app/features/dashboard/components/DashNav/DashNav';
import { DashboardModel } from 'app/features/dashboard/state';

import { AccessControlAction, AnalyticsTab } from '../types';

import { getRecentUsers, UserViewDTO } from './api';
import { openDrawer } from './state/actions';

export interface Props {
  dashboard?: DashboardModel;
}

const mapDispatchToProps = {
  openDrawer,
};

const connector = connect(null, mapDispatchToProps);
export type PresenceIndicatorsProps = ConnectedProps<typeof connector> & Props;

const iconLimit = 4;
const refreshInterval = 60000; // In milliseconds

function fetchRecentUsers(dashboardId: number, setRecentUsers: React.Dispatch<React.SetStateAction<UserViewDTO[]>>) {
  const user = contextSrv.user;
  getRecentUsers(dashboardId, iconLimit + 10).then((data) => {
    const items = data.filter((item: UserViewDTO) => item.user.id !== user.id);
    setRecentUsers((recentUsers: UserViewDTO[]) => (isEqual(items, recentUsers) ? recentUsers : items));
  });
}

export const PresenceIndicators: FC<PresenceIndicatorsProps> = ({ dashboard, openDrawer }) => {
  const dashboardId = dashboard?.id;
  const [recentUsers, setRecentUsers] = useState<UserViewDTO[]>([]);

  useEffect(() => {
    if (!dashboardId || !dashboard?.meta.url) {
      return undefined;
    }

    fetchRecentUsers(dashboardId, setRecentUsers);
    const interval = setInterval(() => fetchRecentUsers(dashboardId, setRecentUsers), refreshInterval);
    return () => {
      clearInterval(interval);
    };
  }, [dashboardId, dashboard]);

  return <UsersIndicator users={recentUsers} limit={iconLimit} onClick={() => openDrawer(AnalyticsTab.Users)} />;
};

export const initPresenceIndicators = () => {
  if (contextSrv.hasPermission(AccessControlAction.DashboardsInsightsRead)) {
    addCustomLeftAction({
      show: () => true,
      component: connector(PresenceIndicators),
      index: 'end',
    });
  }
};
