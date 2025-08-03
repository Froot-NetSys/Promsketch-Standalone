import { SelectableValue } from '@grafana/data';
import { Icon, MultiSelect } from '@grafana/ui';
import { FilterProps } from 'app/features/admin/UserListAdminPage';

import { LICENSED_ROLE_FILTER } from './constants';

const permissionOptions = [
  { value: 'server_admin', label: 'Server admin' },
  { value: 'admin_editor', label: 'Admin/editor' },
  { value: 'viewer', label: 'Viewer' },
];

export const AdminRoleFilter = ({ filters, onChange, className }: FilterProps) => {
  return (
    <MultiSelect
      value={filters.find((f) => f.name === LICENSED_ROLE_FILTER)?.value as SelectableValue[]}
      options={permissionOptions}
      onChange={(value) => {
        onChange({ name: LICENSED_ROLE_FILTER, value });
      }}
      prefix={<Icon name={'filter'} />}
      width={64}
      placeholder={'Filter by licensed role'}
      menuShouldPortal
      className={className}
    />
  );
};
