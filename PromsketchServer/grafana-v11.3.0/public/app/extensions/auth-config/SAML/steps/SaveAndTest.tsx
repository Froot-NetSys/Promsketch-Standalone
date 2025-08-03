import { useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { reportInteraction } from '@grafana/runtime';
import { Button, Stack, Text } from '@grafana/ui';

import { EnterpriseStoreState, SAMLFormData, SAMLStepKey } from '../../../types';
import SAMLForm from '../SAMLForm';
import { saveSAMLSettings } from '../state/actions';
import { clearSAMLState, settingsUpdated } from '../state/reducers';

type SaveAndTestData = Pick<SAMLFormData, 'enabled'>;

function mapStateToProps(state: EnterpriseStoreState) {
  const {
    samlSettings,
    storedSamlSettings,
    keyCertValueType,
    metadataValueType,
    signRequests,
    keyConfigured,
    certConfigured,
  } = state.samlConfig;
  return {
    samlSettings,
    storedSamlSettings,
    keyCertValueType,
    metadataValueType,
    signRequests,
    keyConfigured,
    certConfigured,
  };
}

const mapDispatchToProps = {
  settingsUpdated,
  saveSAMLSettings,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector>;

export const SaveAndTestUnconnected = ({
  samlSettings,
  storedSamlSettings,
  keyCertValueType,
  metadataValueType,
  signRequests,
  keyConfigured,
  certConfigured,
  settingsUpdated,
  saveSAMLSettings,
}: Props): JSX.Element => {
  const {
    handleSubmit,
    getValues,
    formState: { isDirty },
  } = useForm();

  const saveData = ({ enabled }: SaveAndTestData) => {
    if (isDirty) {
      settingsUpdated({
        ...samlSettings,
        enabled,
      });
    }
  };

  const onSaveAndEnable = async () => {
    let formData: SAMLFormData = {
      ...samlSettings,
      keyCertValueType,
      keyConfigured,
      certConfigured,
      signRequests,
      metadataValueType,
      enabled: true,
    };

    saveSAMLSettings(formData, storedSamlSettings);
    reportInteraction('authentication_saml_saved');
    clearSAMLState();
  };

  return (
    <SAMLForm
      activeStep={SAMLStepKey.SaveAndTest}
      onSubmit={handleSubmit(saveData)}
      confirmRedirect={isDirty}
      getFormData={getValues}
      label="Test and enable"
    >
      <Stack direction={'column'} alignItems={'flex-start'} gap={2}>
        <Text>
          If you are ready to apply your SAML configuration use the “Save and enable” button. You will be able to
          disable the configuration.
        </Text>
        <Button variant="primary" onClick={onSaveAndEnable}>
          Save and enable
        </Button>
      </Stack>
    </SAMLForm>
  );
};

export default connector(SaveAndTestUnconnected);
