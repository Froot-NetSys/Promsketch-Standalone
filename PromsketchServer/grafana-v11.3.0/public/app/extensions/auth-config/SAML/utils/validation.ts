import { pem, pki } from 'node-forge';

import { ValidationResult } from '../../../shared/types';
import { SAMLFormData, SAMLStepKey } from '../../../types';
import { samlSteps } from '../../steps';

type ValidationFunc = (config: SAMLFormData) => ValidationResult;

function validateAndUpdateResult(func: ValidationFunc, config: SAMLFormData, result: ValidationResult) {
  updateValidationResult(result, func(config));
}

export function validateConfig(config: SAMLFormData): ValidationResult {
  const validationRes: ValidationResult = { valid: true, errors: [] };
  validateAndUpdateResult(validateConfigGeneral, config, validationRes);
  validateAndUpdateResult(validateConfigKeyCert, config, validationRes);
  validateAndUpdateResult(validateConfigConnectToIdP, config, validationRes);
  validateAndUpdateResult(validateConfigAssertionMapping, config, validationRes);
  return validationRes;
}

export function getMissingFields(config: SAMLFormData, step: SAMLStepKey) {
  switch (step) {
    case SAMLStepKey.General:
      return !validateConfigGeneral(config).valid;
    case SAMLStepKey.KeyCert:
      return !validateConfigKeyCert(config).valid;
    case SAMLStepKey.ConnectToIdP:
      return !validateConfigConnectToIdP(config).valid;
    case SAMLStepKey.AssertionMapping:
      return !validateConfigAssertionMapping(config).valid;
    default:
      return false;
  }
}

export function getValidationResults(formData: SAMLFormData) {
  const validationRes = {} as Record<SAMLStepKey, ValidationResult>;
  samlSteps.forEach(({ id }) => {
    switch (id) {
      case SAMLStepKey.General:
        validationRes[id] = validateConfigGeneral(formData);
        return;
      case SAMLStepKey.KeyCert:
        validationRes[id] = validateConfigKeyCert(formData);
        return;
      case SAMLStepKey.ConnectToIdP:
        validationRes[id] = validateConfigConnectToIdP(formData);
        return;
      case SAMLStepKey.AssertionMapping:
        validationRes[id] = validateConfigAssertionMapping(formData);
        return;
    }
  });
  return validationRes;
}

export function validateConfigGeneral(config: SAMLFormData): ValidationResult {
  const validationRes: ValidationResult = { valid: true, errors: [] };
  const { allowIdpInitiated, relayState } = config;

  if (allowIdpInitiated === true && !relayState) {
    setValidationError(validationRes, 'Relay state should be configured');
  }
  if (relayState && relayState.length > 80) {
    // RelayState data MAY be included with a SAML protocol message transmitted with this binding. The value
    // MUST NOT exceed 80 bytes in length and SHOULD be integrity protected by the entity
    // https://docs.oasis-open.org/security/saml/v2.0/saml-bindings-2.0-os.pdf
    setValidationError(validationRes, 'Relay state should be 80 characters or less');
  }

  return validationRes;
}

export function validateConfigKeyCert(config: SAMLFormData): ValidationResult {
  const validationRes: ValidationResult = { valid: true, errors: [] };
  const { signRequests, privateKey, privateKeyPath, certificate, certificatePath } = config;

  if (signRequests && !privateKey && !privateKeyPath) {
    setValidationError(validationRes, 'Private key should be configured if sign requests is enabled');
  }
  if (signRequests && !certificate && !certificatePath) {
    setValidationError(validationRes, 'Certificate key should be configured if sign requests is enabled');
  }
  if (privateKey && !privateKey.startsWith('***') && !validateBase64PEMKey(privateKey)) {
    setValidationError(validationRes, 'Not valid PEM private key');
  }
  if (certificate && !certificate.startsWith('***') && !validateBase64PEMCert(certificate)) {
    setValidationError(validationRes, 'Not valid PEM certificate');
  }

  return validationRes;
}

export function validateConfigConnectToIdP(config: SAMLFormData): ValidationResult {
  const validationRes: ValidationResult = { valid: true, errors: [] };
  const { idpMetadataUrl, idpMetadataPath, idpMetadata, metadataValueType } = config;
  if (
    (metadataValueType === 'base64' && !idpMetadata) ||
    (metadataValueType === 'url' && !idpMetadataUrl) ||
    (metadataValueType === 'path' && !idpMetadataPath) ||
    (!idpMetadataUrl && !idpMetadataPath && !idpMetadata)
  ) {
    setValidationError(validationRes, 'IdP metadata should be configured');
  }

  return validationRes;
}

export function validateConfigAssertionMapping(config: SAMLFormData): ValidationResult {
  const validationRes: ValidationResult = { valid: true, errors: [] };
  return validationRes;
}

function updateValidationResult(oldRes: ValidationResult, newRes: ValidationResult) {
  if (!newRes.valid) {
    oldRes.valid = false;
    oldRes.errors?.push(...newRes.errors!);
  }
}

function setValidationError(res: ValidationResult, error: string) {
  res.valid = false;
  res.errors?.push(error);
}

export function isValidDuration(value: string): boolean {
  const durationPattern = /^([0-9]*(\.[0-9]*)?[smh]+)+$/;
  return durationPattern.test(value);
}

export function validateBase64PEMKey(data: string): boolean {
  try {
    const decoded = atob(data);
    return checkPKCS8Format(decoded);
  } catch (error) {
    return false;
  }
}

export function checkPKCS8Format(data: string): boolean {
  // FIXME: should return the error message to use in the UI
  // this would help the user to understand what is wrong with the cert
  // that is uploaded
  try {
    const k = pem.decode(data);
    if (k.length > 1) {
      return false;
    }
    const firstkey = k[0];
    if (firstkey.type !== 'PRIVATE KEY') {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function validateBase64PEMCert(data: string): boolean {
  try {
    const decoded = atob(data);
    return validatePEMCert(decoded);
  } catch (error) {
    return false;
  }
}

export function validatePEMCert(cert: string): boolean {
  // FIXME: should return the error message to use in the UI
  // this would help the user to understand what is wrong with the cert
  // that is uploaded
  try {
    const crt = pki.certificateFromPem(cert);
    // check if certificate is expired
    const now = new Date();
    if (crt.validity.notBefore > now || crt.validity.notAfter < now) {
      /*
    crt.validity.notBefore Fri Jul 08 2022 08:06:08 GMT+0100 (Western European Summer Time)
    crt.validity.notAfter Sat Jul 08 2023 08:06:08 GMT+0100 (Western European Summer Time)
    */
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
