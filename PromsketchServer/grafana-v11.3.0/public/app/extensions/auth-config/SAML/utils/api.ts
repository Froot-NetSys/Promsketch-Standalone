import { config, getBackendSrv, isFetchError } from "@grafana/runtime";
import { contextSrv } from 'app/core/core';
import { saveSettings } from 'app/features/auth-config/state/actions';
import { AccessControlAction, SettingsSection, ThunkResult } from "app/types";

import { SettingsError } from "../../../../features/auth-config";
import { SAMLFormData, SAMLSettings } from "../../../types";
import { resetError, setError } from "../state/reducers";

import { makeSettingsDiff, parseSAMLSettings, prepareSaveSAMLData } from "./index";

const isSAMLSSOEnabled = () => {
  return config.featureToggles?.ssoSettingsApi && config.featureToggles?.ssoSettingsSAML;
}

export async function getSAMLSettings(): Promise<[SAMLSettings, any]> {
  if (isSAMLSSOEnabled()) {
    return getSSOSAMLConfig();
  } else {
    return getSettingsProviderSAMLConfig();
  }
}

async function getSettingsProviderSAMLConfig(): Promise<[SAMLSettings, any]> {
  const result = await getBackendSrv().get('/api/admin/settings');
  const samlSettingsRaw = result!['auth.saml'] || {};
  const samlSettings = parseSAMLSettings(samlSettingsRaw);

  return [samlSettings, samlSettingsRaw];
}

async function getSSOSAMLConfig(): Promise<[SAMLSettings, any]> {
  const result = await getBackendSrv().get('/api/v1/sso-settings/saml');
  const samlSettings = result ? result.settings : {};
  const samlSettingsRaw = ssoToRawSettings(samlSettings);

  return [samlSettings, samlSettingsRaw];
}

export function updateSAMLSettings(formData: SAMLFormData, savedSettings: SettingsSection): ThunkResult<Promise<boolean>> {
  if (isSAMLSSOEnabled()) {
    const samlSettings = formDataToSSOData(formData);
    return updateSSOSAMLConfig(samlSettings);
  } else {
    return updateSettingsProviderSAMLConfig(formData, savedSettings);
  }
}

function updateSettingsProviderSAMLConfig(formData: SAMLFormData, savedSettings: SettingsSection): ThunkResult<Promise<boolean>> {
  const data = prepareSaveSAMLData(formData);

  // Only update modified options
  if (data.updates) {
    const diff = makeSettingsDiff(data.updates['auth.saml'], savedSettings);
    data.updates['auth.saml'] = diff;
  }

  return saveSettings(data);
}

function updateSSOSAMLConfig(samlSettings: SAMLSettings): ThunkResult<Promise<boolean>> {
  return async (dispatch) => {
    if (contextSrv.hasPermission(AccessControlAction.SettingsWrite)) {
      try {
        await getBackendSrv().put(
          `/api/v1/sso-settings/saml`,
          {
            provider: 'saml',
            settings: { ...samlSettings },
          },
          {
            showErrorAlert: false,
          }
        );
        dispatch(resetError());
        return true;
      } catch (error) {
        if (isFetchError(error)) {
          error.isHandled = true;
          const updateErr: SettingsError = {
            message: error.data?.message,
            errors: error.data?.errors,
          };
          dispatch(setError(updateErr));
          return false;
        }
      }
    }
    return false;
  };
}

export function removeSAMLSettings(): ThunkResult<Promise<boolean>> {
  if (isSAMLSSOEnabled()) {
    return removeSSOSAMLConfig();
  } else {
    return removeSettingsProviderSAMLConfig();
  }
}

function removeSSOSAMLConfig(): ThunkResult<Promise<boolean>> {
  return async (dispatch) => {
    if (contextSrv.hasPermission(AccessControlAction.SettingsWrite)) {
      try {
        await getBackendSrv().delete(
          `/api/v1/sso-settings/saml`,
          undefined,
          {
            showSuccessAlert: false,
            showErrorAlert: false,
          },
        );
        dispatch(resetError());
        return true;
      } catch (error) {
        if (isFetchError(error)) {
          error.isHandled = true;
          const removeErr: SettingsError = {
            message: error.data?.message,
            errors: error.data?.errors,
          };
          dispatch(setError(removeErr));
          return false;
        }
      }
    }
    return false;
  };
}

function removeSettingsProviderSAMLConfig(): ThunkResult<Promise<boolean>> {
  const removeData = {
    removals: {
      'auth.saml': [
        'enabled',
        'name',
        'single_logout',
        'allow_sign_up',
        'auto_login',
        'certificate',
        'certificate_path',
        'private_key',
        'private_key_path',
        'signature_algorithm',
        'idp_metadata',
        'idp_metadata_path',
        'idp_metadata_url',
        'max_issue_delay',
        'metadata_valid_duration',
        'allow_idp_initiated',
        'relay_state',
        'assertion_attribute_name',
        'assertion_attribute_login',
        'assertion_attribute_email',
        'assertion_attribute_groups',
        'assertion_attribute_role',
        'assertion_attribute_org',
        'allowed_organizations',
        'org_mapping',
        'role_values_none',
        'role_values_viewer',
        'role_values_editor',
        'role_values_admin',
        'role_values_grafana_admin',
        'name_id_format',
        'skip_org_role_sync',
        'client_id',
        'client_secret',
        'token_url',
        'force_use_graph_api',
      ],
    },
  };

  return saveSettings(removeData);
}

export function enableSAMLSettings(samlSettings: SAMLSettings): ThunkResult<Promise<boolean>> {
  if (isSAMLSSOEnabled()) {
    return enableSSOSAMLConfig(samlSettings);
  } else {
    return enableSettingsProviderSAMLConfig();
  }
}

function enableSSOSAMLConfig(samlSettings: SAMLSettings): ThunkResult<Promise<boolean>> {
  return updateSSOSAMLConfig({
    ...samlSettings,
    enabled: true,
  });
}

function enableSettingsProviderSAMLConfig(): ThunkResult<Promise<boolean>> {
  const enableData = {
    updates: {
      'auth.saml': { enabled: 'true' },
    },
  };

  return saveSettings(enableData);
}

export function disableSAMLSettings(samlSettings: SAMLSettings): ThunkResult<Promise<boolean>> {
  if (isSAMLSSOEnabled()) {
    return disableSSOSAMLConfig(samlSettings);
  } else {
    return disableSettingsProviderSAMLConfig();
  }
}

function disableSSOSAMLConfig(samlSettings: SAMLSettings): ThunkResult<Promise<boolean>> {
  return updateSSOSAMLConfig({
    ...samlSettings,
    enabled: false,
  });
}

function disableSettingsProviderSAMLConfig(): ThunkResult<Promise<boolean>> {
  const enableData = {
    updates: {
      'auth.saml': { enabled: 'false' },
    },
  };

  return saveSettings(enableData);
}

function ssoToRawSettings(samlSettings: SAMLSettings): any {
  return {
    enabled: samlSettings?.enabled ? 'true' : 'false',
    name: samlSettings?.name,
    allow_sign_up: samlSettings?.allowSignUp ? 'true' : 'false',
    auto_login: samlSettings?.autoLogin ? 'true' : 'false',
    single_logout: samlSettings?.singleLogout ? 'true' : 'false',
    allow_idp_initiated: samlSettings?.allowIdpInitiated ? 'true' : 'false',
    skip_org_role_sync: samlSettings?.skipOrgRoleSync ? 'true' : 'false',
    private_key: samlSettings?.privateKey,
    private_key_path: samlSettings?.privateKeyPath,
    certificate: samlSettings?.certificate,
    certificate_path: samlSettings?.certificatePath,
    signature_algorithm: samlSettings?.signatureAlgorithm,
    idp_metadata: samlSettings?.idpMetadata,
    idp_metadata_path: samlSettings?.idpMetadataPath,
    idp_metadata_url: samlSettings?.idpMetadataUrl,
    max_issue_delay: samlSettings?.maxIssueDelay,
    metadata_valid_duration: samlSettings?.metadataValidDuration,
    relay_state: samlSettings?.relayState,
    assertion_attribute_name: samlSettings?.assertionAttributeName,
    assertion_attribute_login: samlSettings?.assertionAttributeLogin,
    assertion_attribute_email: samlSettings?.assertionAttributeEmail,
    assertion_attribute_groups: samlSettings?.assertionAttributeGroups,
    assertion_attribute_role: samlSettings?.assertionAttributeRole,
    assertion_attribute_org: samlSettings?.assertionAttributeOrg,
    allowed_organizations: samlSettings?.allowedOrganizations,
    org_mapping: samlSettings?.orgMapping,
    role_values_none: samlSettings?.roleValuesNone,
    role_values_viewer: samlSettings?.roleValuesViewer,
    role_values_editor: samlSettings?.roleValuesEditor,
    role_values_admin: samlSettings?.roleValuesAdmin,
    role_values_grafana_admin: samlSettings?.roleValuesGrafanaAdmin,
    name_id_format: samlSettings?.nameIdFormat,
    client_id: samlSettings?.clientId,
    client_secret: samlSettings?.clientSecret,
    token_url: samlSettings?.tokenUrl,
    force_use_graph_api: samlSettings?.forceUseGraphApi ? 'true' : 'false',
  };
}

function formDataToSSOData(data: SAMLFormData): SAMLSettings {
  return {
    enabled: data?.enabled,
    name: data?.name,
    allowSignUp: data?.allowSignUp,
    autoLogin: data?.autoLogin,
    singleLogout: data?.singleLogout,
    allowIdpInitiated: data?.allowIdpInitiated,
    skipOrgRoleSync: data?.skipOrgRoleSync,
    privateKey: data?.privateKey,
    privateKeyPath: data?.privateKeyPath,
    certificate: data?.certificate,
    certificatePath: data?.certificatePath,
    signatureAlgorithm: data?.signatureAlgorithm,
    idpMetadata: data?.idpMetadata,
    idpMetadataPath: data?.idpMetadataPath,
    idpMetadataUrl: data?.idpMetadataUrl,
    maxIssueDelay: data?.maxIssueDelay,
    metadataValidDuration: data?.metadataValidDuration,
    relayState: data?.relayState,
    assertionAttributeName: data?.assertionAttributeName,
    assertionAttributeLogin: data?.assertionAttributeLogin,
    assertionAttributeEmail: data?.assertionAttributeEmail,
    assertionAttributeGroups: data?.assertionAttributeGroups,
    assertionAttributeRole: data?.assertionAttributeRole,
    assertionAttributeOrg: data?.assertionAttributeOrg,
    allowedOrganizations: data?.allowedOrganizations,
    orgMapping: data?.orgMapping,
    roleValuesNone: data?.roleValuesNone,
    roleValuesViewer: data?.roleValuesViewer,
    roleValuesEditor: data?.roleValuesEditor,
    roleValuesAdmin: data?.roleValuesAdmin,
    roleValuesGrafanaAdmin: data?.roleValuesGrafanaAdmin,
    nameIdFormat: data?.nameIdFormat,
    clientId: data?.clientId,
    clientSecret: data?.clientSecret,
    tokenUrl: data?.tokenUrl,
    forceUseGraphApi: data?.forceUseGraphApi,
  };
}
