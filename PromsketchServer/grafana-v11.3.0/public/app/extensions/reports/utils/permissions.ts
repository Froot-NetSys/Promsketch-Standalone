import { contextSrv } from 'app/core/core';

import { AccessControlAction } from '../../types';

export const canEditReport =
  contextSrv.hasPermission(AccessControlAction.ReportingWrite) ||
  contextSrv.hasPermission(AccessControlAction.ReportingCreate);
