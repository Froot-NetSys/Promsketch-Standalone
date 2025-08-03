import forge from "node-forge";
import { FormEvent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { AppEvents, SelectableValue } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';
import { Button, Field, RadioButtonGroup, Switch } from '@grafana/ui';

import { EnterpriseStoreState, KeyCertFormData, SAMLFormData, SAMLStepKey } from '../../../types';
import { InputWithReset } from '../../components/InputWithReset';
import { TextInputWithReset } from '../../components/TextInputWithReset';
import SAMLForm from '../SAMLForm';
import {
  setKeyCertValueType,
  setKeyConfigured,
  setCertConfigured,
  settingsUpdated,
  setSignRequests,
} from '../state/reducers';
import { isConfiguredKeyCert } from '../utils';
import { validateBase64PEMCert, validateBase64PEMKey } from '../utils/validation';

import KeyCertDrawer from "./KeyCertDrawer";

type KeyCertData = Pick<
  SAMLFormData,
  | 'signRequests'
  | 'keyCertValueType'
  | 'keyConfigured'
  | 'certConfigured'
  | 'signatureAlgorithm'
  | 'privateKey'
  | 'privateKeyPath'
  | 'certificate'
  | 'certificatePath'
>;

function mapStateToProps(state: EnterpriseStoreState) {
  const { samlSettings, storedSamlSettings, signRequests, keyCertValueType, keyConfigured, certConfigured } =
    state.samlConfig;
  return {
    samlSettings,
    storedSettings: storedSamlSettings,
    signRequests,
    keyCertValueType,
    keyConfigured,
    certConfigured,
  };
}

const mapDispatchToProps = {
  settingsUpdated,
  setSignRequests,
  setKeyCertValueType,
  setKeyConfigured,
  setCertConfigured,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector>;

const certOptions = [
  { label: 'Base64-encoded content', value: 'base64' },
  { label: 'Path to file', value: 'path' },
];

const signatureOptions: Array<SelectableValue<string>> = [
  { label: 'RSA-SHA256', value: 'rsa-sha256' },
  { label: 'RSA-SHA512', value: 'rsa-sha512' },
  { label: 'RSA-SHA1', value: 'rsa-sha1' },
];

const defaultData: KeyCertData = {
  signRequests: false,
  privateKey: '',
  privateKeyPath: '',
  certificate: '',
  certificatePath: '',
  signatureAlgorithm: '',
  keyConfigured: false,
  certConfigured: false,
  keyCertValueType: 'base64',
};

export const KeyCertUnconnected = ({
  samlSettings,
  storedSettings,
  signRequests,
  keyCertValueType,
  keyConfigured,
  certConfigured,
  setKeyCertValueType,
  setSignRequests,
  setKeyConfigured,
  setCertConfigured,
  settingsUpdated,
}: Props): JSX.Element => {
  const { privateKey, privateKeyPath, certificate, certificatePath, signatureAlgorithm } = samlSettings || {};
  const {
    handleSubmit,
    control,
    register,
    watch,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      privateKey: privateKey || '',
      privateKeyPath: privateKeyPath || '',
      certificate: certificate || '',
      certificatePath: certificatePath || '',
      signatureAlgorithm: signatureAlgorithm || 'rsa-sha256',
      keyCertValueType,
      signRequests: signRequests || !!privateKey || !!privateKeyPath || !!certificate || !!certificatePath || !!signatureAlgorithm,
      keyConfigured: false,
      certConfigured: false,
    },
  });

  const appEvents = getAppEvents();
  const [showCertDrawer, setShowCertDrawer] = useState(false);

  const watchSignRequests = watch('signRequests');
  const watchKeyCertValueType = watch('keyCertValueType');

  const formData = getValues();
  const privateKeyConfigured = keyConfigured && isConfiguredKeyCert('privateKey', formData, storedSettings);
  const privateKeyPathConfigured = keyConfigured && isConfiguredKeyCert('privateKeyPath', formData, storedSettings);
  const certificateConfigured = certConfigured && isConfiguredKeyCert('certificate', formData, storedSettings);
  const certificatePathConfigured = certConfigured && isConfiguredKeyCert('certificatePath', formData, storedSettings);

  const onSubmit = (data: KeyCertData) => {
    if (isDirty) {
      const { signRequests, keyCertValueType, certConfigured, keyConfigured, ...settings } = data;
      if (!signRequests) {
        settingsUpdated({...samlSettings, ...settings, ...defaultData});
        setKeyCertValueType(defaultData.keyCertValueType);
      } else {
        settingsUpdated({...samlSettings, ...settings});
        setKeyCertValueType(keyCertValueType);
      }
      setSignRequests(signRequests);
    }
  };

  const getFormData = () => {
    let { ...data } = getValues();
    if (!watchSignRequests) {
      data = { ...data, ...defaultData };
    }
    return { ...data, keyConfigured, certConfigured };
  };

  const onResetKeyCert = (prop: 'privateKey' | 'privateKeyPath' | 'certificate' | 'certificatePath') => () => {
    setValue(prop, '', { shouldDirty: true });
    if (['privateKey', 'privateKeyPath'].includes(prop)) {
      setKeyConfigured(false);
    } else {
      setCertConfigured(false);
    }
  };

  const onFileUpload = (prop: 'privateKey' | 'certificate') => async (event: FormEvent<HTMLInputElement>) => {
    if (event?.currentTarget?.files?.length) {
      const fileContent = event.currentTarget.files[0];
      const text = await fileContent.text();
      const base64Content = btoa(text);
      setValue(prop, base64Content, { shouldDirty: true });
    }
  };

  function generateRandomHexString(length: number) {
    const hexChars = '0123456789abcdef';
    const random = new Uint32Array(length);

    crypto.getRandomValues(random);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += hexChars[Math.floor(random[i] / 2**32 * hexChars.length)];
    }

    return result;
  }

  const onGenerateCert = (data: KeyCertFormData) => {
    setShowCertDrawer(false);

    const keys = forge.pki.rsa.generateKeyPair(2048);
    const rsaPrivateKey = forge.pki.privateKeyToAsn1(keys.privateKey);
    const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01' + generateRandomHexString(16);
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * data.validityDays);

    const attrs = [{
      name: 'organizationName',
      value: data.organization,
    }, {
      name: 'countryName',
      value: data.country,
    }, {
      shortName: 'ST',
      value: data.state,
    }, {
      name: 'localityName',
      value: data.city,
    }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // self-sign certificate
    cert.sign(keys.privateKey);

    // convert a Forge certificate and private key to PEM
    const pem = forge.pki.certificateToPem(cert);
    const privateKey = forge.pki.privateKeyInfoToPem(privateKeyInfo)

    setValue('privateKey', btoa(privateKey), { shouldDirty: true });
    setValue('certificate', btoa(pem), { shouldDirty: true });

    appEvents.publish({
      type: AppEvents.alertSuccess.name,
      payload: [
        'The SAML certificate and key have been successfully generated.',
      ],
    });
  };

  const isKeyCertValid = (value: string, configured: boolean, type: 'privateKey' | 'certificate') => {
    if (configured) {
      return true;
    }
    if (keyCertValueType === 'base64' && type === 'privateKey') {
      if (value && !validateBase64PEMKey(value)) {
        return 'Not valid PEM key';
      }
    }
    if (keyCertValueType === 'base64' && type === 'certificate') {
      if (value && !validateBase64PEMCert(value)) {
        return 'Not valid PEM certificate';
      }
    }
    return true;
  };

  return (
    <SAMLForm
      activeStep={SAMLStepKey.KeyCert}
      onSubmit={handleSubmit(onSubmit)}
      confirmRedirect={isDirty}
      getFormData={getFormData}
      label="Sign requests"
    >
      <Field label="Sign requests" description="Sign outgoing requests to IdP">
        <Switch {...register('signRequests')} id="signRequests" />
      </Field>

      {watchSignRequests && (
        <>
          <Field
            label="Signing and encryption key and certificate"
            htmlFor="certOptions"
            description="Certificate and private key for exchanging information between the Grafana and the IdP.
              The private key needs to be issued in a PKCS#8 format. Certificate should be valid X.509 certificate."
          >
            <Controller
              name={'keyCertValueType'}
              control={control}
              render={({ field: { ref, ...field } }) => {
                return <RadioButtonGroup {...field} options={certOptions} id="certOptions" />;
              }}
            />
          </Field>

          {watchKeyCertValueType === 'base64' && (
            <>
              <Field
                label="Private key"
                htmlFor="privateKey"
                description="Base64-encoded private key"
                invalid={!!errors.privateKey}
                error={errors.privateKey?.message}
              >
                <Controller
                  name={'privateKey'}
                  control={control}
                  rules={{
                    validate: (val) => {
                      return isKeyCertValid(val, keyConfigured, 'privateKey');
                    },
                  }}
                  render={({ field: { ref, ...field } }) => {
                    return (
                      <TextInputWithReset
                        {...field}
                        id="privateKey"
                        required
                        isConfigured={privateKeyConfigured}
                        onReset={onResetKeyCert('privateKey')}
                        onFileUpload={onFileUpload('privateKey')}
                      />
                    );
                  }}
                />
              </Field>
              <Field
                label="Certificate"
                htmlFor="certificate"
                description="Base64-encoded Grafana X.509 certificate"
                invalid={!!errors.certificate}
                error={errors.certificate?.message}
              >
                <Controller
                  name={'certificate'}
                  control={control}
                  rules={{
                    validate: (val) => {
                      return isKeyCertValid(val, certConfigured, 'certificate');
                    },
                  }}
                  render={({ field: { ref, ...field } }) => {
                    return (
                      <TextInputWithReset
                        {...field}
                        id="certificate"
                        required
                        isConfigured={certificateConfigured}
                        onReset={onResetKeyCert('certificate')}
                        onFileUpload={onFileUpload('certificate')}
                      />
                    );
                  }}
                />
              </Field>
              <Field>
                <Button variant="secondary" onClick={() => setShowCertDrawer(true)}>
                  Generate key and certificate
                </Button>
              </Field>
              {showCertDrawer && <KeyCertDrawer onClose={() => setShowCertDrawer(false)} onGenerateCert={onGenerateCert}></KeyCertDrawer>}
            </>
          )}

          {watchKeyCertValueType === 'path' && (
            <>
              <Field
                label="Private key"
                description="Path to the Grafana private key"
                invalid={!!errors.privateKey}
                error={errors.privateKey?.message}
              >
                <Controller
                  name={'privateKeyPath'}
                  control={control}
                  render={({ field: { ref, ...field } }) => {
                    return (
                      <InputWithReset
                        {...field}
                        width={60}
                        id="privateKeyPath"
                        isConfigured={privateKeyPathConfigured}
                        onReset={onResetKeyCert('privateKeyPath')}
                      />
                    );
                  }}
                />
              </Field>
              <Field
                label="Certificate"
                description="Path to the Grafana X.509 certificate"
                invalid={!!errors.certificate}
                error={errors.certificate?.message}
              >
                <Controller
                  name={'certificatePath'}
                  control={control}
                  render={({ field: { ref, ...field } }) => {
                    return (
                      <InputWithReset
                        {...field}
                        width={60}
                        id="certificatePath"
                        isConfigured={certificatePathConfigured}
                        onReset={onResetKeyCert('certificatePath')}
                      />
                    );
                  }}
                />
              </Field>
            </>
          )}

          <Field
            label="Signature algorithm"
            htmlFor="signatureAlgorithm"
            description="Signature algorithm used for signing requests to the IdP. Must be the same as set-up or required by IdP."
          >
            <Controller
              name={'signatureAlgorithm'}
              control={control}
              render={({ field: { ref, ...field } }) => {
                return <RadioButtonGroup {...field} options={signatureOptions} id="signatureAlgorithm" />;
              }}
            />
          </Field>
        </>
      )}
    </SAMLForm>
  );
};

export default connector(KeyCertUnconnected);
