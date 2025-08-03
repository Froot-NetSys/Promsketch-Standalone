import React, { useState } from 'react';

import { Button, Field, Input, Stack } from '@grafana/ui';
import { RolePicker } from 'app/core/components/RolePicker/RolePicker';
import { useRoleOptions } from 'app/core/components/RolePicker/hooks';
import { contextSrv } from 'app/core/core';
import type { Role } from 'app/types';

import { useGroupSyncWriter } from './api';
import type { Group } from './types';

type Props = {
  onSave: (group: Group) => void;
};

export function NewMappingForm({ onSave }: Props) {
  const writerAPI = useGroupSyncWriter();
  const [{ roleOptions }] = useRoleOptions(contextSrv.user.orgId);
  const [roles, setRoles] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    writerAPI
      .save(contextSrv.user.orgId)
      .then(() => {
        setSaving(false);
        setRoles([]);
        onSave(writerAPI.group);
        writerAPI.reset();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleGroupIDChange: React.FormEventHandler<HTMLInputElement> = (event) => {
    writerAPI.setGroupID(event.currentTarget.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={1} alignItems="end">
        <Field label="Group ID" style={{ marginBottom: 0 }}>
          <Input type="text" name="groupID" value={writerAPI.group.groupID} onChange={handleGroupIDChange} width={50} />
        </Field>
        <Field label="Roles" style={{ marginBottom: 0 }}>
          <RolePicker
            appliedRoles={roles}
            onRolesChange={(roles) => {
              setRoles(roles);
              writerAPI.setRoles(
                contextSrv.user.orgId,
                roles.map((role) => role.uid)
              );
            }}
            roleOptions={roleOptions}
            basicRoleDisabled={true}
            canUpdateRoles
          />
        </Field>
        <Button type="submit" disabled={!writerAPI.canSave() || saving}>
          Save
        </Button>
      </Stack>
    </form>
  );
}
