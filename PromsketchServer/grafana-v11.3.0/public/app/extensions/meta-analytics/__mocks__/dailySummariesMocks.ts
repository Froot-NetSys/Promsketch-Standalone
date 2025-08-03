import { DashboardDailySummaryDTO } from '../api';

export const getMockDailySummaries = (): DashboardDailySummaryDTO[] => {
  const dailySummaries = [];
  for (let i = 1; i <= 30; i++) {
    dailySummaries.push({
      day: `2020-05-${i < 10 ? '0' + i : i}`,
      dashboardId: 0,
      views: i * 28,
      queries: 0,
      cachedQueries: 0,
      errors: 0,
      loadDuration: 0,
    });
  }
  return dailySummaries;
};
