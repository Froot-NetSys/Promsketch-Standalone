import { locationService } from '@grafana/runtime';

import { StepKey } from '../../types';
import { reportSteps } from '../index';

import { getSectionUrl } from './url';

export const getNextStep = (currentStep?: StepKey) => {
  if (!currentStep) {
    return reportSteps[0];
  }
  const index = reportSteps.findIndex((step) => step.id === currentStep);

  // If the last step, return it
  if (index === reportSteps.length - 1) {
    return reportSteps[index];
  }

  return reportSteps[index + 1];
};

export const getPreviousStep = (currentStep?: StepKey) => {
  if (!currentStep || currentStep === reportSteps[0].id) {
    return;
  }

  const index = reportSteps.findIndex((step) => step.id === currentStep);

  return reportSteps[index - 1];
};

export const goToPreviousStep = (currentStep?: StepKey, reportId?: string) => {
  const previous = getPreviousStep(currentStep);
  if (previous && previous.id !== currentStep) {
    locationService.push(getSectionUrl(previous.id, reportId));
  }
};
