import { variableAdapters } from 'app/features/variables/adapters';
import { createCustomVariableAdapter } from 'app/features/variables/custom/adapter';
import { createDataSourceVariableAdapter } from 'app/features/variables/datasource/adapter';
import { createQueryVariableAdapter } from 'app/features/variables/query/adapter';
import { createTextBoxVariableAdapter } from 'app/features/variables/textbox/adapter';

import { multiOptionAllSelectedVar, multiOptionVar, optionVar, textBoxVariable, customVariable } from './testData';
import { applyDefaultVariables, toReportVariables } from './variables';

variableAdapters.setInit(() => [
  createQueryVariableAdapter(),
  createTextBoxVariableAdapter(),
  createCustomVariableAdapter(),
  createDataSourceVariableAdapter(),
]);

describe('Report variable utils', () => {
  describe('toReportVariables', () => {
    const variables = [multiOptionAllSelectedVar, multiOptionVar, optionVar, textBoxVariable, customVariable];
    it('should return undefined if no variables are provided', () => {
      expect(toReportVariables(undefined)).toEqual({});
    });
    it('should return undefined for an empty variable object', () => {
      expect(toReportVariables({} as any)).toEqual({});
    });

    it('should return an object with values as string array and filter out keys with empty values', () => {
      expect(toReportVariables(variables as any)).toEqual({
        custom: ['1', '2'],
        datacenter: ['A'],
        datasource: ['gdev-postgres'],
        pod: ['All'],
        text: ['test'],
      });
    });
  });

  describe('applyDefaultVariables', () => {
    const reportVariables = {
      custom: ['1', '2', 'three'],
      datacenter: ['A', 'C'],
      datasource: ['PostgreSQL'],
      pod: ['AAA', 'AAC'],
      text: ['test variable'],
    };

    expect(applyDefaultVariables([multiOptionAllSelectedVar], reportVariables)[0]).toEqual({
      ...multiOptionAllSelectedVar,
      current: {
        value: ['AAA', 'AAC'],
        text: ['AAA', 'AAC'],
        selected: true,
      },
      options: [
        {
          text: 'All',
          value: '$__all',
          selected: false,
        },
        {
          text: 'AAA',
          value: 'AAA',
          selected: true,
        },
        {
          text: 'AAB',
          value: 'AAB',
          selected: false,
        },
        {
          text: 'AAC',
          value: 'AAC',
          selected: true,
        },
      ],
    });

    expect(applyDefaultVariables([multiOptionVar], reportVariables)[0]).toEqual({
      ...multiOptionVar,
      current: {
        value: ['A', 'C'],
        text: ['A', 'C'],
        selected: true,
      },
      options: [
        {
          text: 'All',
          value: '$__all',
          selected: false,
        },
        {
          text: 'A',
          value: 'A',
          selected: true,
        },
        {
          text: 'B',
          value: 'B',
          selected: false,
        },
        {
          text: 'C',
          value: 'C',
          selected: true,
        },
      ],
    });

    expect(applyDefaultVariables([customVariable], reportVariables)[0]).toEqual({
      ...customVariable,
      current: {
        value: ['1', '2', 'three'],
        text: ['1', '2', '3'],
        tags: [],
        selected: true,
      },
      options: [
        {
          selected: false,
          text: 'All',
          value: '$__all',
        },
        {
          selected: true,
          text: '1',
          value: '1',
        },
        {
          selected: true,
          text: '2',
          value: '2',
        },
        {
          selected: true,
          text: '3',
          value: 'three',
        },
        {
          selected: false,
          text: '4',
          value: 'four',
        },
      ],
    });

    expect(applyDefaultVariables([textBoxVariable], reportVariables)[0]).toEqual({
      ...textBoxVariable,
      current: {
        selected: true,
        text: 'test variable',
        value: 'test variable',
      },
      options: [
        {
          selected: false,
          text: 'test',
          value: 'test',
        },
      ],
    });
  });
});
