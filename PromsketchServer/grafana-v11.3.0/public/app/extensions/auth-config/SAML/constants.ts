import { config } from '@grafana/runtime';

export const BASE_URL = '/admin/authentication/saml';

export const SAML_Metadata_URL = config.appUrl + 'saml/metadata';
export const SAML_ACS_URL = config.appUrl + 'saml/acs';
export const SAML_SLO_URL = config.appUrl + 'saml/slo';
