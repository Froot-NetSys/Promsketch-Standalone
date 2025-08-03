import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SettingsError } from 'app/features/auth-config';
import { SettingsSection } from 'app/types';

import { SAMLConfigState, SAMLSettings, SAMLStepKey } from '../../../types';

export const defaultSamlSettings: SAMLSettings = {
  assertionAttributeName: 'displayName',
  assertionAttributeLogin: 'mail',
  assertionAttributeEmail: 'mail',
};

export const initialState: SAMLConfigState = {
  storedSamlSettings: {},
  samlSettings: {},
  samlStep: 1,
  activeStep: SAMLStepKey.General,
  signRequests: false,
  keyCertValueType: 'base64',
  keyConfigured: false,
  certConfigured: false,
  metadataValueType: 'url',
  configChanged: false,
  showSavedBadge: false,
  visitedSteps: [],
  isUpdated: false,
  isLoading: false,
  configFoundInIniFile: false,
};

const authConfigSAMLSlice = createSlice({
  name: 'samlConfig',
  initialState,
  reducers: {
    settingsLoaded: (state, action: PayloadAction<SAMLSettings>): SAMLConfigState => {
      return {
        ...state,
        samlSettings: action.payload,
        configChanged: false,
        isLoading: false,
      };
    },
    setStoredSAMLSettings: (state, action: PayloadAction<SettingsSection>): SAMLConfigState => {
      return { ...state, storedSamlSettings: action.payload };
    },
    setConfigFoundInIniFile: (state, action: PayloadAction<boolean>): SAMLConfigState => {
      return { ...state, configFoundInIniFile: action.payload };
    },
    settingsUpdated: (state, action: PayloadAction<SAMLSettings>): SAMLConfigState => {
      return { ...state, samlSettings: action.payload, configChanged: true };
    },
    settingsLoadingBegin: (state: SAMLConfigState) => ({
      ...state,
      isLoading: true,
    }),
    settingsLoadingEnd: (state: SAMLConfigState) => ({
      ...state,
      isLoading: false,
    }),
    samlStepChanged: (state, action: PayloadAction<number>): SAMLConfigState => {
      return { ...state, samlStep: action.payload };
    },
    setSignRequests: (state, action: PayloadAction<boolean>): SAMLConfigState => {
      return { ...state, signRequests: action.payload };
    },
    setKeyCertValueType: (state, action: PayloadAction<'path' | 'base64'>): SAMLConfigState => {
      return { ...state, keyCertValueType: action.payload };
    },
    setKeyConfigured: (state, action: PayloadAction<boolean>): SAMLConfigState => {
      return { ...state, keyConfigured: action.payload };
    },
    setCertConfigured: (state, action: PayloadAction<boolean>): SAMLConfigState => {
      return { ...state, certConfigured: action.payload };
    },
    setMetadataValueType: (state, action: PayloadAction<'path' | 'base64' | 'url'>): SAMLConfigState => {
      return { ...state, metadataValueType: action.payload };
    },
    settingsChanged: (state, action: PayloadAction<boolean>): SAMLConfigState => {
      return { ...state, configChanged: action.payload };
    },
    setError: (state, action: PayloadAction<SettingsError>): SAMLConfigState => {
      return { ...state, error: action.payload };
    },
    resetError: (state): SAMLConfigState => {
      return { ...state, error: undefined };
    },
    setShowSavedBadge: (state, action: PayloadAction<boolean>): SAMLConfigState => {
      return { ...state, showSavedBadge: action.payload };
    },
    addVisitedStep: (state: SAMLConfigState, action: PayloadAction<SAMLStepKey[]>) => {
      return { ...state, visitedSteps: [...state.visitedSteps, ...action.payload] };
    },
    clearSAMLState: (state: SAMLConfigState): SAMLConfigState => ({
      ...state,
      isUpdated: false,
      visitedSteps: [],
    }),
  },
});

export const {
  settingsLoaded,
  settingsUpdated,
  samlStepChanged,
  setStoredSAMLSettings,
  setSignRequests,
  setKeyCertValueType,
  setKeyConfigured,
  setCertConfigured,
  setMetadataValueType,
  settingsChanged,
  setShowSavedBadge,
  setConfigFoundInIniFile,
  addVisitedStep,
  clearSAMLState,
  settingsLoadingBegin,
  settingsLoadingEnd,
  setError,
  resetError,
} = authConfigSAMLSlice.actions;

export const reducer = authConfigSAMLSlice.reducer;

export const authConfigSAMLReducer = {
  samlConfig: reducer,
};
