import { useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { Field, Stack, Input, Switch } from '@grafana/ui';

import { EnterpriseStoreState, SAMLFormData, SAMLStepKey } from '../../../types';
import SAMLForm from '../SAMLForm';
import { settingsUpdated } from '../state/reducers';
import { isValidDuration } from '../utils/validation';

type GeneralData = Pick<
  SAMLFormData,
  | 'allowSignUp'
  | 'name'
  | 'singleLogout'
  | 'allowIdpInitiated'
  | 'relayState'
  | 'maxIssueDelay'
  | 'metadataValidDuration'
  | 'autoLogin'
>;

const mapStateToProps = (state: EnterpriseStoreState) => {
  const { samlSettings } = state.samlConfig;
  return {
    samlSettings,
  };
};

const mapActionsToProps = {
  settingsUpdated,
};

const connector = connect(mapStateToProps, mapActionsToProps);
export type Props = ConnectedProps<typeof connector>;

export const GeneralUnconnected = ({ samlSettings, settingsUpdated }: Props): JSX.Element => {
  const {
    allowSignUp,
    name,
    autoLogin,
    singleLogout,
    allowIdpInitiated,
    relayState,
    maxIssueDelay,
    metadataValidDuration,
  } = samlSettings || {};
  const {
    handleSubmit,
    register,
    watch,
    getValues,
    formState: { isDirty, errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      allowSignUp,
      name,
      autoLogin,
      singleLogout,
      allowIdpInitiated,
      relayState,
      maxIssueDelay,
      metadataValidDuration,
    },
  });

  const watchAllowIdPInitiated = watch('allowIdpInitiated');

  const onSubmit = (data: GeneralData) => {
    if (isDirty) {
      settingsUpdated({ ...samlSettings, ...data });
    }
  };

  const validateDuration = (value?: string) => {
    return !value || isValidDuration(value) ? true : 'Not a valid duration';
  };
  const validateRelayState = (value?: string): boolean | string => {
    if (watchAllowIdPInitiated && !!value) {
      if (value.length > 80) {
        return 'Relay state needs to be 80 characters or less';
      }
      return true;
    } else {
      return 'Relay state is required';
    }
  };

  return (
    <SAMLForm
      activeStep={SAMLStepKey.General}
      onSubmit={handleSubmit(onSubmit)}
      confirmRedirect={isDirty}
      getFormData={getValues}
      label="General settings"
    >
      <Stack>
        <Field
          label="Display name for this SAML 2.0 integration"
          description="Helpful if you use more than one SSO IdP provider or protocol."
        >
          <Input {...register('name')} id="displayName" placeholder="SAML" />
        </Field>
      </Stack>
      <Field
        label="Allow signup"
        description="Whether to allow new Grafana user creation through SAML login. If not enabled, then only existing Grafana users can log in with SAML."
      >
        <Switch {...register('allowSignUp')} defaultChecked={allowSignUp} id="allowSignup" />
      </Field>
      <Field label="Auto login" description="Attempt to log in with SAML automatically, skipping the login screen.">
        <Switch {...register('autoLogin')} defaultChecked={autoLogin} id="autoLogin" />
      </Field>
      <Field
        label="Single logout"
        description="Allows users to log out from IdP session and applications associated with the current IdP session established via SAML."
      >
        <Switch {...register('singleLogout')} defaultChecked={singleLogout} id="singleLogout" />
      </Field>
      <Field
        label="Identity provider initiated login"
        description="Allows users to log in into Grafana directly from identity provider."
      >
        <Switch {...register('allowIdpInitiated')} defaultChecked={allowIdpInitiated} id="allowIdpInitiated" />
      </Field>
      {watchAllowIdPInitiated && (
        <Field
          label="Relay state"
          description="Required. Should match relay state configured in IdP and trailing space is required."
          required={watchAllowIdPInitiated}
          invalid={watchAllowIdPInitiated && !!errors.relayState}
          error={errors.relayState?.message}
        >
          <Input
            {...register('relayState', {
              validate: validateRelayState,
            })}
            width={60}
            id="relayState"
            defaultValue={relayState}
          />
        </Field>
      )}
      <Field
        label="Max issue delay"
        description="Duration, since the IdP issued a response and Grafana is allowed to process it."
        invalid={!!errors.maxIssueDelay}
        error={errors.maxIssueDelay?.message}
      >
        <Input
          {...register('maxIssueDelay', { validate: validateDuration })}
          width={24}
          id="max_issue_delay"
          defaultValue={maxIssueDelay}
          placeholder="90s"
        />
      </Field>
      <Field
        label="Metadata valid duration"
        description="Duration, for how long Grafana metadata is valid."
        invalid={!!errors.metadataValidDuration}
        error={errors.metadataValidDuration?.message}
      >
        <Input
          {...register('metadataValidDuration', { validate: validateDuration })}
          defaultValue={metadataValidDuration}
          width={24}
          id="metadataValidDuration"
          placeholder="48h"
        />
      </Field>
    </SAMLForm>
  );
};

export default connector(GeneralUnconnected);
