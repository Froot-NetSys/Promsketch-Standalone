import { addExtraFilters } from 'app/features/admin/UserListAdminPage';

import { AdminRoleFilter } from './Filters';

export const initEnterpriseAdmin = () => {
  addExtraFilters(AdminRoleFilter);
};
