import { UserViewDTO } from '../api';

export const getMockRecentUsers = (): UserViewDTO[] => {
  const recentUsers = [];

  for (let i = 1; i <= 10; i++) {
    recentUsers.push({
      user: {
        id: i,
        name: `User ${i}`,
        avatarUrl: '/avatar/c84258e9c39059a89ab77d846ddab909',
        email: i % 2 === 0 ? `user${i}@localhost.com` : undefined,
      },
      lastActiveAt: new Date(new Date().setDate(new Date().getDate() - (i + 1))).toISOString(),
    });
  }

  return recentUsers;
};
