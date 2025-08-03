import { TypedVariableModel, VariableRefresh, VariableType, VariableWithOptions } from '@grafana/data';
import { SceneVariable } from '@grafana/scenes';
import { variableAdapters } from 'app/features/variables/adapters';
import { hasOptions, isQuery } from 'app/features/variables/guard';
import { VariableModel } from 'app/features/variables/types';
import { getVariablesFromUrl } from 'app/features/variables/utils';

import { Report } from '../../types';

/**
 * Convert variable values to a map like:
 * { "myVar": ["var1", "var2"] }
 * @param variables
 */
export const toReportVariables = (variables?: VariableModel[]): Record<string, string[]> => {
  if (!variables?.length) {
    return {};
  }

  return Object.fromEntries(
    variables.map((variable) => {
      const { getValueForUrl } = variableAdapters.get(variable.type);
      const value = getValueForUrl(variable);
      return [variable.name, Array.isArray(value) ? value : [value]];
    })
  );
};

export const toReportSceneVariables = (variables?: SceneVariable[]): Record<string, string[]> => {
  if (!variables?.length) {
    return {};
  }

  const variablesFromUrl = getVariablesFromUrl();

  return Object.fromEntries(
    variables.map((variable) => {
      const { name } = variable.state;
      const queryValue = variablesFromUrl[name];
      const queryValueArray = (Array.isArray(queryValue) ? queryValue : [queryValue]).map((q) => q?.toString() ?? '');
      return [name, queryValueArray];
    })
  );
};

export const applyDefaultVariables = (
  variables: VariableModel[],
  reportVariables?: Report['templateVars'],
  repeatValuesSet?: Set<string>
): VariableWithOptions[] | VariableModel[] => {
  if (!reportVariables || !Object.keys(reportVariables).length) {
    return variables.map((v) => ({ ...v, usedInRepeat: repeatValuesSet?.has(v.name) }));
  }

  return variables.map((variable) => {
    const reportVariable = reportVariables[variable.name];
    if (!reportVariable || !hasOptions(variable)) {
      return variable;
    }
    const values = reportVariable
      .map((str) => variable.options.find((opt) => opt.value === str) || { text: str, value: str })
      .filter(Boolean);

    const isMultiVariable = 'multi' in variable && variable.multi;
    return {
      ...variable,
      usedInRepeat: repeatValuesSet?.has(variable.name),
      current: {
        ...variable.current,
        text: isMultiVariable ? values.map((val) => val?.text) : values[0].text,
        value: isMultiVariable ? values.map((val) => val?.value) : values[0].value,
      },
      options: variable.options.map((option) => ({
        ...option,
        selected: typeof option.value === 'string' && reportVariable.includes(option.value),
      })),
    };
  });
};

export const collectVariables = () => {
  const variablePrefix = 'var-';
  const urlParams = new URLSearchParams(window.location.search);
  const variables: Record<string, string[]> = {};

  for (const [key, value] of urlParams.entries()) {
    if (key.startsWith(variablePrefix)) {
      const newKey = key.replace(variablePrefix, '');
      variables[newKey] = [...(variables[newKey] || []), value];
    }
  }

  return variables;
};

export const refreshOnTimeRange = (variables: VariableModel[]) => {
  return variables.some((variable) => isQuery(variable) && variable.refresh === VariableRefresh.onTimeRangeChanged);
};

export const isSelectedVariableInRepeatingPanels = (
  name: string,
  type: VariableType,
  variables: TypedVariableModel[]
) => {
  const selectedVariable = getSelectedVariable(name, type, variables);
  return selectedVariable && selectedVariable.usedInRepeat;
};

export const getSelectedVariable = (
  name: string,
  type: VariableType,
  variables: TypedVariableModel[]
): VariableModel | VariableWithOptions | undefined => {
  return variables.find((variable: VariableWithOptions | VariableModel) => {
    if ('current' in variable && variable.current.value) {
      const isSelected = variable.current.value.length === 1 && variable.current.value[0] === name;
      return isSelected && variable.type === type;
    }
    return false;
  });
};
