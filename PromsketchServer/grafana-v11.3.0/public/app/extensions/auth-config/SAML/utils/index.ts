import { isEqual } from 'lodash';

import { OrgRole } from '@grafana/data';
import { SettingsSection, UpdateSettingsQuery } from 'app/types';

import { SAMLFormData, SAMLSettings, SAMLStepKey } from '../../../types';
import { OrgMappingEntry } from '../../types';
import { BASE_URL } from '../constants';

export function parseSAMLSettings(settings: SettingsSection): SAMLSettings {
  const samlSettings: SAMLSettings = {
    enabled: configToBoolean(settings['enabled']),
    allowSignUp: configToBoolean(settings['allow_sign_up']),
    autoLogin: configToBoolean(settings['auto_login']),
    singleLogout: configToBoolean(settings['single_logout']),
    allowIdpInitiated: configToBoolean(settings['allow_idp_initiated']),
    skipOrgRoleSync: configToBoolean(settings['skip_org_role_sync']),
    name: configToString(settings['name']),
    privateKey: configToString(settings['private_key']),
    privateKeyPath: configToString(settings['private_key_path']),
    certificate: configToString(settings['certificate']),
    certificatePath: configToString(settings['certificate_path']),
    signatureAlgorithm: configToString(settings['signature_algorithm']),
    idpMetadata: configToString(settings['idp_metadata']),
    idpMetadataPath: configToString(settings['idp_metadata_path']),
    idpMetadataUrl: configToString(settings['idp_metadata_url']),
    maxIssueDelay: configToString(settings['max_issue_delay']),
    metadataValidDuration: configToString(settings['metadata_valid_duration']),
    relayState: configToString(settings['relay_state']),
    assertionAttributeName: configToString(settings['assertion_attribute_name']),
    assertionAttributeLogin: configToString(settings['assertion_attribute_login']),
    assertionAttributeEmail: configToString(settings['assertion_attribute_email']),
    assertionAttributeGroups: configToString(settings['assertion_attribute_groups']),
    assertionAttributeRole: configToString(settings['assertion_attribute_role']),
    assertionAttributeOrg: configToString(settings['assertion_attribute_org']),
    allowedOrganizations: configToString(settings['allowed_organizations']),
    orgMapping: configToString(settings['org_mapping']),
    roleValuesNone: configToString(settings['role_values_none']),
    roleValuesViewer: configToString(settings['role_values_viewer']),
    roleValuesEditor: configToString(settings['role_values_editor']),
    roleValuesAdmin: configToString(settings['role_values_admin']),
    roleValuesGrafanaAdmin: configToString(settings['role_values_grafana_admin']),
    nameIdFormat: configToString(settings['name_id_format']),
    clientId: configToString(settings['client_id']),
    clientSecret: configToString(settings['client_secret']),
    tokenUrl: configToString(settings['token_url']),
    forceUseGraphApi: configToBoolean(settings['force_use_graph_api']),
  };

  return samlSettings;
}

function configToBoolean(value: string | undefined) {
  return value === 'true';
}

function configToString(value: string | undefined) {
  return value || '';
}

function booleanToConf(value: boolean | undefined) {
  return value ? 'true' : 'false';
}

export function serializeSAMLSettings(samlSettings: SAMLSettings): SettingsSection {
  const settings: SettingsSection = {
    enabled: booleanToConf(samlSettings.enabled),
    allow_sign_up: booleanToConf(samlSettings.allowSignUp),
    auto_login: booleanToConf(samlSettings.autoLogin),
    single_logout: booleanToConf(samlSettings.singleLogout),
    allow_idp_initiated: booleanToConf(samlSettings.allowIdpInitiated),
    skip_org_role_sync: booleanToConf(samlSettings.skipOrgRoleSync),
    name: configToString(samlSettings.name),
    private_key: configToString(samlSettings.privateKey),
    private_key_path: configToString(samlSettings.privateKeyPath),
    certificate: configToString(samlSettings.certificate),
    certificate_path: configToString(samlSettings.certificatePath),
    signature_algorithm: configToString(samlSettings.signatureAlgorithm),
    idp_metadata: configToString(samlSettings.idpMetadata),
    idp_metadata_path: configToString(samlSettings.idpMetadataPath),
    idp_metadata_url: configToString(samlSettings.idpMetadataUrl),
    max_issue_delay: configToString(samlSettings.maxIssueDelay),
    metadata_valid_duration: configToString(samlSettings.metadataValidDuration),
    relay_state: configToString(samlSettings.relayState),
    assertion_attribute_name: configToString(samlSettings.assertionAttributeName),
    assertion_attribute_login: configToString(samlSettings.assertionAttributeLogin),
    assertion_attribute_email: configToString(samlSettings.assertionAttributeEmail),
    assertion_attribute_groups: configToString(samlSettings.assertionAttributeGroups),
    assertion_attribute_role: configToString(samlSettings.assertionAttributeRole),
    assertion_attribute_org: configToString(samlSettings.assertionAttributeOrg),
    allowed_organizations: configToString(samlSettings.allowedOrganizations),
    org_mapping: configToString(samlSettings.orgMapping),
    role_values_none: configToString(samlSettings.roleValuesNone),
    role_values_viewer: configToString(samlSettings.roleValuesViewer),
    role_values_editor: configToString(samlSettings.roleValuesEditor),
    role_values_admin: configToString(samlSettings.roleValuesAdmin),
    role_values_grafana_admin: configToString(samlSettings.roleValuesGrafanaAdmin),
    name_id_format: configToString(samlSettings.nameIdFormat),
    client_id: configToString(samlSettings.clientId),
    client_secret: configToString(samlSettings.clientSecret),
    token_url: configToString(samlSettings.tokenUrl),
    force_use_graph_api: booleanToConf(samlSettings.forceUseGraphApi),
  };

  return settings;
}

export function prepareSaveSAMLData(settings: Partial<SAMLFormData>) {
  const { keyCertValueType, metadataValueType, signRequests } = settings;
  const {
    certificate_path,
    private_key_path,
    certificate,
    private_key,
    idp_metadata_url,
    idp_metadata_path,
    idp_metadata,
    ...rest
  } = serializeSAMLSettings(settings);
  const data: UpdateSettingsQuery = {
    updates: { 'auth.saml': rest },
    removals: { 'auth.saml': [] },
  };

  if (keyCertValueType === 'path') {
    if (private_key_path && !isHiddenKeyCert(private_key_path)) {
      data.updates!['auth.saml'].private_key_path = private_key_path;
      data.updates!['auth.saml'].private_key = '';
    }
    if (certificate_path && !isHiddenKeyCert(certificate_path)) {
      data.updates!['auth.saml'].certificate_path = certificate_path;
      data.updates!['auth.saml'].certificate = '';
    }
  } else if (keyCertValueType === 'base64') {
    if (private_key && !isHiddenKeyCert(private_key)) {
      data.updates!['auth.saml'].private_key = private_key;
      data.updates!['auth.saml'].private_key_path = '';
    }
    if (certificate && !isHiddenKeyCert(certificate)) {
      data.updates!['auth.saml'].certificate = certificate;
      data.updates!['auth.saml'].certificate_path = '';
    }
  }

  if (!signRequests) {
    data.updates!['auth.saml'].signature_algorithm = '';
  }

  if (metadataValueType === 'url') {
    data.updates!['auth.saml'].idp_metadata_url = idp_metadata_url;
    data.updates!['auth.saml'].idp_metadata_path = '';
    data.updates!['auth.saml'].idp_metadata = '';
  } else if (metadataValueType === 'path') {
    data.updates!['auth.saml'].idp_metadata_path = idp_metadata_path;
    data.updates!['auth.saml'].idp_metadata_url = '';
    data.updates!['auth.saml'].idp_metadata = '';
  } else if (metadataValueType === 'base64') {
    data.updates!['auth.saml'].idp_metadata = idp_metadata;
    data.updates!['auth.saml'].idp_metadata_url = '';
    data.updates!['auth.saml'].idp_metadata_path = '';
  }

  return data;
}

export function makeSettingsDiff(updates: SettingsSection, base: SettingsSection): SettingsSection {
  const diff = {} as SettingsSection;
  Object.keys(updates).forEach((setting) => {
    if (updates[setting] !== base[setting]) {
      diff[setting] = updates[setting];
    }
  });
  return diff;
}

export function splitOrgMapping(value: string): OrgMappingEntry[] {
  const mappings = value?.split(/[,\s]/);
  const result: OrgMappingEntry[] = [];
  mappings?.forEach((m) => {
    const parts = m.split(':');
    if (parts.length === 3) {
      const role = assertOrgRole(parts[2]);
      if (role) {
        result.push({
          externalOrg: parts[0],
          orgId: parts[1],
          role,
        });
      }
    }
  });
  return result;
}

export function orgMappingToString(mapping: OrgMappingEntry[]): string {
  const mappingsStr = mapping.map((m) => `${m.externalOrg}:${m.orgId}:${m.role}`);
  return mappingsStr.join(',');
}

function assertOrgRole(role: string): OrgRole | null {
  if (role === 'Admin' || role === 'Editor' || role === 'Viewer') {
    return role as OrgRole;
  }
  return null;
}

const defaultSettings: SettingsSection = {
  enabled: 'false',
  skip_org_role_sync: 'false',
};

export function isDefaultSAMLConfig(settings: SettingsSection) {
  return isEqual(settings, defaultSettings);
}

export function isHiddenKeyCert(value: string | undefined) {
  if (!value) {
    return false;
  }
  const hiddenPattern = /^\*+$/;
  return hiddenPattern.test(value);
}

export function isConfiguredKeyCert(prop: string, formData: Partial<SAMLFormData>, storedSettings: SettingsSection) {
  switch (prop) {
    case 'privateKey':
      return formData[prop] === storedSettings['private_key'] && !!storedSettings['private_key'];
    case 'privateKeyPath':
      return formData[prop] === storedSettings['private_key_path'] && !!storedSettings['private_key_path'];
    case 'certificate':
      return formData[prop] === storedSettings['certificate'] && !!storedSettings['certificate'];
    case 'certificatePath':
      return formData[prop] === storedSettings['certificate_path'] && !!storedSettings['certificate_path'];
    default:
      return false;
  }
}

export function getMetadataValueType(settings: SAMLSettings): 'path' | 'base64' | 'url' {
  if (settings.idpMetadataPath) {
    return 'path';
  } else if (settings.idpMetadata) {
    return 'base64';
  } else {
    return 'url';
  }
}

export const getSectionUrl = (section: SAMLStepKey) => {
  return `${BASE_URL}/${section || ''}`;
};
