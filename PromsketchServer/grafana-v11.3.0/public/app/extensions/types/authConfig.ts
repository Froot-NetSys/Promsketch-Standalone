import { SettingsError } from 'app/features/auth-config';
import { SettingsSection } from 'app/types';

export interface SAMLConfigState {
  isLoading: boolean;
  samlSettings: SAMLSettings;
  storedSamlSettings: SettingsSection;
  signRequests: boolean;
  keyCertValueType: 'path' | 'base64';
  keyConfigured: boolean;
  certConfigured: boolean;
  metadataValueType: 'path' | 'base64' | 'url';
  configChanged: boolean;
  showSavedBadge: boolean;
  isUpdated?: boolean;
  samlStep: number;
  activeStep: SAMLStepKey;
  visitedSteps: SAMLStepKey[];
  error?: SettingsError;
  configFoundInIniFile?: boolean;
}

export enum SAMLStepKey {
  General = 'general',
  KeyCert = 'key-cert',
  ConnectToIdP = 'connect-to-idp',
  AssertionMapping = 'assertion-mapping',
  SaveAndTest = 'save-and-test',
}

export interface SAMLSettings {
  enabled?: boolean;
  name?: string;
  allowSignUp?: boolean;
  autoLogin?: boolean;
  singleLogout?: boolean;
  allowIdpInitiated?: boolean;
  skipOrgRoleSync?: boolean;
  privateKey?: string;
  privateKeyPath?: string;
  certificate?: string;
  certificatePath?: string;
  signatureAlgorithm?: string;
  idpMetadata?: string;
  idpMetadataPath?: string;
  idpMetadataUrl?: string;
  maxIssueDelay?: string;
  metadataValidDuration?: string;
  relayState?: string;
  assertionAttributeName?: string;
  assertionAttributeLogin?: string;
  assertionAttributeEmail?: string;
  assertionAttributeGroups?: string;
  assertionAttributeRole?: string;
  assertionAttributeOrg?: string;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  forceUseGraphApi?: boolean;
  allowedOrganizations?: string;
  orgMapping?: string;
  roleValuesNone?: string;
  roleValuesViewer?: string;
  roleValuesEditor?: string;
  roleValuesAdmin?: string;
  roleValuesGrafanaAdmin?: string;
  nameIdFormat?: string;
}

export interface SAMLFormData extends SAMLSettings {
  signRequests: boolean;
  keyCertValueType: 'path' | 'base64';
  keyConfigured: boolean;
  certConfigured: boolean;
  metadataValueType: 'path' | 'base64' | 'url';
}

export interface KeyCertFormData {
  validityDays: number;
  organization: string;
  country: string;
  state: string;
  city: string;
}
