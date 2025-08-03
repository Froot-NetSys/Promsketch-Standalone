import { OrgRole } from '@grafana/data';

export interface OrgMappingEntry {
  orgId: string;
  role: OrgRole;
  externalOrg: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export type VerboseSettingsSection = Record<
  string,
  {
    db: string;
    system: string;
  }
>;

export type VerboseSettings = Record<string, VerboseSettingsSection>;
