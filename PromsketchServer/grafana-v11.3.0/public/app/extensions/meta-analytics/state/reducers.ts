import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AnalyticsTab, MetaAnalyticsState } from '../../types';

const initialState: MetaAnalyticsState = {
  isDrawerOpen: false,
  drawerTab: AnalyticsTab.Stats,
};

const metaAnalyticsSlice = createSlice({
  name: 'metaAnalytics',
  initialState,
  reducers: {
    setDrawerOpen: (state: MetaAnalyticsState, action: PayloadAction<boolean>): MetaAnalyticsState => ({
      ...state,
      isDrawerOpen: action.payload,
    }),
    setDrawerTab: (state: MetaAnalyticsState, action: PayloadAction<AnalyticsTab>): MetaAnalyticsState => ({
      ...state,
      drawerTab: action.payload,
    }),
  },
});

export const { setDrawerOpen, setDrawerTab } = metaAnalyticsSlice.actions;

export const metaAnalyticsReducers = metaAnalyticsSlice.reducer;

export default {
  metaAnalytics: metaAnalyticsReducers,
};
