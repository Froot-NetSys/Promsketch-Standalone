import { css } from '@emotion/css';
import { forwardRef, PropsWithChildren, useImperativeHandle, useRef } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, useStyles2 } from '@grafana/ui';

import { Report, StepKey } from '../../types';
import { selectors } from '../e2e-selectors/selectors';
import { getButtonText } from '../utils/pageActions';
import { getNextStep } from '../utils/stepper';

import { ButtonHandle } from './ButtonRow';

export interface Props {
  saveDraft: () => void;
  activeStep: StepKey;
  existingReport: boolean;
  disabled?: boolean;
  onDiscard: () => void;
  schedule?: Report['schedule'];
}

export const PageActions = forwardRef<ButtonHandle, PropsWithChildren<Props>>(
  ({ saveDraft, children, existingReport, disabled, activeStep, onDiscard, schedule }, ref) => {
    const styles = useStyles2(getStyles);
    const nextStep = getNextStep(activeStep);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const isLastStep = nextStep.id === activeStep;
    const buttonText = existingReport ? 'Update report' : getButtonText(schedule);

    // Enable clicking Submit from a parent component
    useImperativeHandle(ref, () => ({
      click: () => {
        buttonRef.current?.click();
      },
    }));

    return (
      <div className={styles.container}>
        {isLastStep && (
          <Button
            ref={buttonRef}
            disabled={disabled}
            type="submit"
            data-testid={selectors.components.reportForm.submitButton}
          >
            {buttonText}
          </Button>
        )}
        <Button variant={'secondary'} onClick={saveDraft}>
          Save as draft
        </Button>
        {children}
        <Button variant={'destructive'} fill={'outline'} onClick={onDiscard}>
          Discard
        </Button>
      </div>
    );
  }
);

PageActions.displayName = 'PageActions';

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      justify-content: flex-end;
      width: 100%;

      & > button,
      & > a {
        margin-right: ${theme.spacing(3)};
      }
    `,
  };
};
