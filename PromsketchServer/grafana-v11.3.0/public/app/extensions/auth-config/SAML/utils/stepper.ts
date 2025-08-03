import { locationService } from '@grafana/runtime';

import { SAMLStepKey } from '../../../types';
import { samlSteps } from '../../steps';

import { getSectionUrl } from '.';

export const getNextStep = (currentStep?: SAMLStepKey) => {
  if (!currentStep) {
    return samlSteps[0];
  }
  const index = samlSteps.findIndex((step) => step.id === currentStep);

  // If the last step, return it
  if (index === samlSteps.length - 1) {
    return samlSteps[index];
  }

  return samlSteps[index + 1];
};

export const getPreviousStep = (currentStep?: SAMLStepKey) => {
  if (!currentStep || currentStep === samlSteps[0].id) {
    return;
  }

  const index = samlSteps.findIndex((step) => step.id === currentStep);

  return samlSteps[index - 1];
};

export const goToPreviousStep = (currentStep?: SAMLStepKey) => {
  const previous = getPreviousStep(currentStep);
  if (previous && previous.id !== currentStep) {
    locationService.push(getSectionUrl(previous.id));
  }
};
