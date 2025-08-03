import { DataSourceJsonData, DataSourceSettings } from '@grafana/data';
import { ResourcePermission } from 'app/core/components/AccessControl/types';
import { t } from 'app/core/internationalization';

import { TeamRule } from '../types';

export const DataSourcesWithLBACSupport = ['loki'];

export const LBACHTTPHeaderName = 'X-Prom-Label-Policy';

export function hasLBACSupport(ds: DataSourceSettings<DataSourceJsonData, {}>): boolean {
  return !!ds.basicAuth && DataSourcesWithLBACSupport.includes(ds.type);
}

export function trimLBACRule(rule: string) {
  const pattern = /\{([^{}]*)\}/;
  const res = pattern.exec(rule);
  if (res && res.length > 1) {
    return res[1].trim();
  }
  return '';
}

export function formatLBACRule(labelSelector: string) {
  const pattern = /\{{0,1}([^\{\}]*)\}{0,1}/;
  const res = pattern.exec(labelSelector);
  if (res && res.length > 1) {
    return `{ ${res[1].trim()} }`;
  }
  return '';
}

export function extractLBACRule(rule: string) {
  const pattern = /\w+\:\{{0,1}([^\{\}]*)\}{0,1}/;
  const res = pattern.exec(rule);
  if (res && res.length > 1) {
    return res[1].trim();
  }
  return '';
}

export const validateLBACRule = (str: string): boolean => {
  if (!str) {
    return false;
  }
  const trimmedStr = str.trim().replace(/^{|}$/g, '');
  const pattern = /^\s*(?:\s*\w+\s*(?:=|!=|=~|!~)\s*\"[^\"]+\"\s*,*)+\s*$/;
  return pattern.test(trimmedStr);
};

export const getLBACTeamsConfigured = (rules: TeamRule[]): number[] => {
  const teams: number[] = [];
  if (rules.length) {
    rules.forEach((rule) => {
      if (Number(rule.teamId)) {
        teams.push(Number(rule.teamId));
      }
    });
  }
  return teams;
};

export const addTeamLBACWarnings = (
  teams: number[],
  items: ResourcePermission[],
) => {
  const warningServiceAccount = t(
    'access-control.permissions.lbac-warning-service-account',
    'Warning: This service account has full data access if no LBAC rules are set.'
  );
  const warningTeam = t(
    'access-control.permissions.lbac-warning-team',
    'Warning: This team has full data access if no LBAC rules are set.'
  );
  return items.map((item) => {
    if (item.builtInRole && item.permission !== 'Admin') {
      const warningBasicRole = t(
        'access-control.permissions.lbac-warning-basic-role',
        `Warning: ${item.builtInRole} may have full data access if permission is not removed.`
      );
      item.warning = warningBasicRole;
    } else if (item.isServiceAccount && item.userId) {
      item.warning = warningServiceAccount;
    } else if (item.teamId && !teams.includes(item.teamId)) {
      item.warning = warningTeam;
    }
    return { ...item };
  });
};

export const addTeamLBACWarningsToLBACRule = (teams: number[], items: TeamRule[]) => {
  const warningTeam = t(
    'access-control.permissions.lbac-warning-rule',
    'Warning: This team might not have permission to the query the datasource.'
  );
  return items.map((item) => {
    // teamspermissions does not exists
    // but we have items.teamId
    if (item.teamId && !teams.includes(Number(item.teamId))) {
      item.warning = warningTeam;
    }
    // check ruleTeamIds does not include any of the teams id
    return { ...item };
  });
};
