import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PrometheusWriteTarget, RecordedQueriesState, RecordedQuery } from '../../types';

export const initialState: RecordedQueriesState = {
  recordedQueries: [],
  isLoading: false,
  errorRecordedQueryTestResponse: '',
};

const recordedQueriesSlice = createSlice({
  name: 'recorded-queries',
  initialState,
  reducers: {
    loadRecordedQueries: (state) => {
      return { ...state, isLoading: true };
    },
    endLoadRecordedQueries: (state) => {
      return { ...state, isLoading: false };
    },
    loadedRecordedQueries: (state, action: PayloadAction<RecordedQuery[]>): RecordedQueriesState => {
      const recordedQueries: RecordedQuery[] = action.payload;

      return { ...state, recordedQueries };
    },
    updateRecordedQueries: (state, action: PayloadAction<RecordedQuery>): RecordedQueriesState => {
      const changed = action.payload;
      const recordedQueries = state.recordedQueries.map((rq) => (rq.id === changed.id ? changed : rq));
      return { ...state, recordedQueries };
    },
    deleteRecordedQueries: (state, action: PayloadAction<RecordedQuery>): RecordedQueriesState => {
      const changed = action.payload;
      const recordedQueries = state.recordedQueries.filter((rq) => rq.id !== changed.id);
      return { ...state, recordedQueries };
    },
    setPrometheusWriteTarget: (state, action: PayloadAction<PrometheusWriteTarget>): RecordedQueriesState => {
      const prometheusWriteTarget = action.payload;
      return { ...state, prometheusWriteTarget };
    },
  },
});

export const {
  loadRecordedQueries,
  endLoadRecordedQueries,
  loadedRecordedQueries,
  updateRecordedQueries,
  deleteRecordedQueries,
  setPrometheusWriteTarget,
} = recordedQueriesSlice.actions;

export const reducer = recordedQueriesSlice.reducer;

export const recordedQueryReducer = {
  recordedQueries: reducer,
};
