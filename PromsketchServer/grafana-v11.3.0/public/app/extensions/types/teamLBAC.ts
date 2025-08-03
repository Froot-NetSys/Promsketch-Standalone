import { DataSourceJsonData } from '@grafana/data';
import { Team } from 'app/types';

export interface TeamLBACState {
  teamLBACConfig: TeamLBACConfig;
}

export interface TeamHTTPHeaderJsonData extends DataSourceJsonData {
  teamHttpHeaders: TeamHeaders;
}

export interface TeamHeader {
  header: string;
  value: string;
}

export interface TeamHeaders {
  headers?: { [K: number | string]: TeamHeader[] };
  restrictAccess?: boolean;
}

export interface TeamLBACRule {
  id: number;
  team?: Team;
  teamId: number;
  labelSelector: string;
}

export interface TeamLBACConfig {
  rules?: TeamRule[];
}

export interface TeamRule {
  teamId: string;
  rules: string[];
  warning?: string;
}
