export enum AnalyticsTab {
  Stats = 'stats',
  Users = 'users',
  PublicDashboards = 'public-dashboards',
}

export interface MetaAnalyticsState {
  isDrawerOpen: boolean;
  drawerTab: AnalyticsTab;
}
