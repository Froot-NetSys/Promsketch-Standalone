import { LoadingState, VariableType } from '@grafana/data';

export const multiOptionVar = {
  allValue: null,
  current: {
    value: ['A'],
    text: ['A'],
    selected: true,
  },
  rootStateKey: 'key',
  datasource: 'gdev-testdata',
  definition: '*',
  hide: 0,
  includeAll: true,
  multi: true,
  name: 'datacenter',
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
      selected: true,
    },
    {
      text: 'C',
      value: 'C',
      selected: false,
    },
  ],
  query: {
    refId: 'gdev-testdata-datacenter-Variable-Query',
    query: '*',
  },
  refresh: 1,
  regex: '',
  skipUrlSync: false,
  sort: 0,
  tagValuesQuery: '',
  tags: [],
  tagsQuery: '',
  type: 'query' as VariableType,
  useTags: false,
  id: 'datacenter',
  global: false,
  index: 0,
  state: LoadingState.Done,
  error: null,
  description: null,
};

export const multiOptionAllSelectedVar = {
  allValue: null,
  current: {
    value: ['$__all'],
    text: ['All'],
    selected: true,
  },
  rootStateKey: 'key',
  datasource: 'gdev-testdata',
  definition: '$datacenter.$server.*',
  hide: 0,
  includeAll: true,
  multi: true,
  name: 'pod',
  options: [
    {
      text: 'All',
      value: '$__all',
      selected: true,
    },
    {
      text: 'AAA',
      value: 'AAA',
      selected: false,
    },
    {
      text: 'AAB',
      value: 'AAB',
      selected: false,
    },
    {
      text: 'AAC',
      value: 'AAC',
      selected: false,
    },
  ],
  query: {
    refId: 'gdev-testdata-pod-Variable-Query',
    query: '$datacenter.$server.*',
  },
  refresh: 1,
  regex: '',
  skipUrlSync: false,
  sort: 0,
  tagValuesQuery: '',
  tags: [],
  tagsQuery: '',
  type: 'query' as VariableType,
  useTags: false,
  id: 'pod',
  global: false,
  index: 2,
  state: LoadingState.Done,
  error: null,
  description: null,
};

export const optionVar = {
  current: {
    text: 'gdev-postgres',
    value: 'gdev-postgres',
    selected: false,
  },
  description: null,
  error: null,
  hide: 0,
  includeAll: true,
  label: 'Datasource',
  multi: false,
  name: 'datasource',
  options: [
    {
      text: 'All',
      value: '$__all',
      selected: false,
    },
    {
      text: 'gdev-postgres',
      value: 'gdev-postgres',
      selected: true,
    },
    {
      text: 'gdev-postgres-ds-tests',
      value: 'gdev-postgres-ds-tests',
      selected: false,
    },
    {
      text: 'PostgreSQL',
      value: 'PostgreSQL',
      selected: false,
    },
  ],
  query: 'postgres',
  refresh: 1,
  regex: '',
  skipUrlSync: false,
  type: 'datasource' as VariableType,
  id: 'datasource',
  global: false,
  index: 3,
  state: LoadingState.Done,
};

export const textBoxVariable = {
  current: {
    selected: true,
    text: 'test',
    value: 'test',
  },
  rootStateKey: 'key',
  description: null,
  error: null,
  hide: 0,
  name: 'text',
  options: [
    {
      selected: true,
      text: 'test',
      value: 'test',
    },
  ],
  query: 'test',
  skipUrlSync: false,
  type: 'textbox' as VariableType,
  originalQuery: 'test',
  id: 'test',
  global: false,
  index: 1,
  state: LoadingState.Done,
};

export const adHocVariable = {
  datasource: 'PostgreSQL',
  description: null,
  error: null,
  filters: [],
  hide: 0,
  label: 'Ad hoc',
  name: 'adhoc',
  skipUrlSync: false,
  type: 'adhoc' as VariableType,
  id: 'adhoc',
  global: false,
  index: 5,
  state: LoadingState.Done,
};

export const customVariable = {
  allValue: null,
  current: {
    selected: true,
    tags: [],
    text: ['1', '2'],
    value: ['1', '2'],
  },
  rootStateKey: 'key',
  description: null,
  error: null,
  hide: 0,
  includeAll: true,
  multi: true,
  name: 'custom',
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
      selected: false,
      text: '3',
      value: 'three',
    },
    {
      selected: false,
      text: '4',
      value: 'four',
    },
  ],
  query: '1,2,3 : three, 4 : four',
  queryValue: '',
  skipUrlSync: false,
  type: 'custom' as VariableType,
  id: 'custom',
  global: false,
  index: 4,
  state: LoadingState.Done,
};

export const variables = [multiOptionAllSelectedVar, multiOptionVar, optionVar, textBoxVariable, customVariable];
