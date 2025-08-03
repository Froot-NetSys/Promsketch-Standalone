import { css, cx } from '@emotion/css';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useNavigate, Location } from 'react-router-dom-v5-compat';

import { GrafanaTheme2 } from '@grafana/data';
import { reportInteraction } from '@grafana/runtime';
import { Badge, FieldSet, Legend, useStyles2 } from '@grafana/ui';
import { FormPrompt } from 'app/core/components/FormPrompt/FormPrompt';
import ErrorContainer from 'app/features/auth-config/ErrorContainer';

import { Stepper } from '../../shared/Stepper';
import { SAMLFormData, SAMLStepKey, EnterpriseStoreState } from '../../types';
import { ValidationErrorContainer } from '../components/ValidationErrorContainer';
import { samlSteps } from '../steps';

import { ButtonRow } from './ButtonRow';
import { ConfigActionBar } from './ConfigActionBar';
import { saveSAMLSettings, enableSAML, disableSAML, resetSAMLSettings } from './state/actions';
import { addVisitedStep, clearSAMLState, resetError, setError } from './state/reducers';
import { getSectionUrl, isDefaultSAMLConfig } from './utils';
import { getNextStep } from './utils/stepper';
import { getValidationResults } from './utils/validation';

const mapStateToProps = (state: EnterpriseStoreState) => {
  const {
    samlSettings,
    storedSamlSettings,
    isUpdated,
    visitedSteps,
    keyCertValueType,
    keyConfigured,
    certConfigured,
    signRequests,
    metadataValueType,
    showSavedBadge,
    error,
  } = state.samlConfig;
  return {
    isUpdated,
    samlSettings,
    storedSamlSettings,
    visitedSteps,
    keyCertValueType,
    keyConfigured,
    certConfigured,
    signRequests,
    metadataValueType,
    showSavedBadge,
    error,
  };
};

const mapActionsToProps = {
  addVisitedStep,
  clearSAMLState,
  saveSAMLSettings,
  enableSAML,
  disableSAML,
  resetSAMLSettings,
  setError,
  resetError,
};

export interface OwnProps {
  activeStep: SAMLStepKey;
  children: React.ReactNode;
  confirmRedirect?: boolean;
  getFormData?: () => Partial<SAMLFormData>;
  onSubmit: () => void;
  label?: string;
  className?: string;
}

const connector = connect(mapStateToProps, mapActionsToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;

const SAMLForm = ({
  samlSettings,
  storedSamlSettings,
  keyCertValueType,
  metadataValueType,
  signRequests,
  activeStep,
  addVisitedStep,
  children,
  clearSAMLState,
  confirmRedirect,
  keyConfigured,
  certConfigured,
  isUpdated,
  error,
  resetError,
  visitedSteps,
  showSavedBadge,
  label,
  className,
  getFormData,
  onSubmit,
  saveSAMLSettings,
  enableSAML,
  disableSAML,
  resetSAMLSettings,
}: Props) => {
  const styles = useStyles2(getStyles);
  const nextStep = getNextStep(activeStep);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [redirect, setRedirect] = useState(confirmRedirect || isUpdated);
  const navigate = useNavigate();

  useEffect(() => {
    const addStep = (step: SAMLStepKey) => {
      reportInteraction('authentication_saml_step', { step: step });

      if (step === samlSteps[samlSteps.length - 1].id) {
        addVisitedStep(samlSteps.map((step) => step.id));
      } else {
        addVisitedStep([step]);
      }
    };
    addStep(activeStep);
  }, [activeStep, addVisitedStep]);

  useEffect(() => {
    setRedirect(confirmRedirect || isUpdated);
  }, [confirmRedirect, isUpdated]);

  const onSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const url = getSectionUrl(nextStep.id);
    onSubmit();
    navigate(url);
  };

  const getSAMLFormData = () => {
    let formData: SAMLFormData = {
      ...samlSettings,
      keyCertValueType,
      signRequests,
      metadataValueType,
      keyConfigured,
      certConfigured,
    };
    if (getFormData) {
      const data = getFormData();
      formData = { ...formData, ...data };
    }
    return formData;
  };

  const saveSettings = async (enable?: boolean) => {
    const formData = getSAMLFormData();
    if (enable) {
      formData.enabled = true;
    }

    saveSAMLSettings(formData, storedSamlSettings);
    reportInteraction('authentication_saml_saved', { enabled: formData.enabled });
    setRedirect(false);
    clearSAMLState();
  };

  const onEnableInternal = () => {
    reportInteraction('authentication_saml_enabled');
    enableSAML(samlSettings);
  };

  const onDisableInternal = () => {
    reportInteraction('authentication_saml_disabled');
    disableSAML(samlSettings);
  };

  const onSAMLConfigDiscarded = () => {
    clearSAMLState();
    reportInteraction('authentication_saml_abandoned');
  };

  const onRemoveInternal = () => {
    reportInteraction('authentication_saml_removed');
    resetSAMLSettings();
  };

  // Detect navigation outside of form to clear form state if no changes to the form have been made
  const detectLeavingForm = (location: Location) => {
    const urls = samlSteps.map((step) => getSectionUrl(step.id));
    return !urls.includes(location.pathname);
  };

  const onStepChange = () => {
    const lastId = samlSteps[samlSteps.length - 1].id;
    // Do not submit for the last step
    if (activeStep !== lastId) {
      buttonRef.current?.click();
    }
  };

  const validationResults = getValidationResults(getSAMLFormData());

  return (
    <form onSubmit={onSubmitCustom} className={styles.container}>
      <ConfigActionBar
        enabled={samlSettings.enabled!}
        isNewConfig={isDefaultSAMLConfig(storedSamlSettings)}
        onSave={() => saveSettings()}
        onSaveAndEnable={() => saveSettings(true)}
        onEnable={onEnableInternal}
        onDisable={onDisableInternal}
        onRemove={onRemoveInternal}
      />
      {/*@ts-expect-error TODO update the types in FormPrompt*/}
      <FormPrompt confirmRedirect={redirect} onDiscard={onSAMLConfigDiscarded} onLocationChange={detectLeavingForm} />
      <div className={styles.inner}>
        <Stepper
          steps={samlSteps}
          activeStep={activeStep}
          visitedSteps={visitedSteps}
          onStepChange={onStepChange}
          getNextUrl={getSectionUrl}
          validationResults={validationResults}
        />
        <ErrorContainer />
        <ValidationErrorContainer error={error} onReset={resetError} />
        <div className={cx(styles.content, className!)}>
          <FieldSet
            label={
              <div className={styles.header}>
                {label && <Legend>{label}</Legend>}
                <div>{showSavedBadge && <Badge text="Saved" color="green" icon="check" />}</div>
              </div>
            }
          >
            {children}
          </FieldSet>
          <ButtonRow ref={buttonRef} activeStep={activeStep} />
        </div>
      </div>
    </form>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      align-content: center;
    `,
    header: css`
      display: flex;
      justify-content: space-between;
    `,
    inner: css`
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      flex: 1 0 auto;
    `,
    content: css`
      padding-bottom: ${theme.spacing(3)};
    `,
  };
};

export default connector(SAMLForm);
