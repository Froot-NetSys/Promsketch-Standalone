import { RecordedQueriesState } from '../../types';

export const getRecordedQueryItems = (state: RecordedQueriesState) => state.recordedQueries;
export const getRecordedQueryWriter = (state: RecordedQueriesState) => state.prometheusWriteTarget;
