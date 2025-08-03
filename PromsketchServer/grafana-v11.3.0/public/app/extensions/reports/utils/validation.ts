import { ValidationResult } from '../../shared/types';
import { FormRequiredFields, Report, StepKey } from '../../types';
import { reportSteps } from '../index';

const arrayFieldIsValid = (field: Report[keyof Report]) => {
  if (Array.isArray(field)) {
    return field?.length;
  }

  return true;
};

export const getValidationResults = (report: Report) => {
  const requiredFields: FormRequiredFields = [
    { step: StepKey.SelectDashboard, fields: ['dashboards'] },
    { step: StepKey.FormatReport, fields: ['formats'] },
    { step: StepKey.Share, fields: ['name', 'recipients'] },
  ];
  const hasMissingDashboard = !report.dashboards?.[0]?.dashboard?.uid;
  return reportSteps.reduce((sum, curr) => {
    sum[curr.id] = { valid: true };
    if (curr.id === StepKey.SelectDashboard) {
      sum[StepKey.SelectDashboard].valid = !hasMissingDashboard;
      return sum;
    } else {
      const fields = requiredFields.find((field) => field.step === curr.id)?.fields;
      if (fields) {
        sum[curr.id].valid = fields.every((field: keyof Report) => report[field] && arrayFieldIsValid(report[field]));
      }
      return sum;
    }
  }, {} as Record<StepKey, ValidationResult>);
};

export const getMissingFields = (report: Report, id?: StepKey) => {
  const results = getValidationResults(report);
  if (id) {
    return !results[id].valid;
  }
  return Object.values(results).some((field) => !field.valid);
};
