import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { TeamLBACConfig, TeamLBACState, TeamRule } from '../../types';

export const initialState: TeamLBACState = {
  teamLBACConfig: { rules: [] as TeamRule[] },
};

const teamLBACSlice = createSlice({
  name: 'teamLBAC',
  initialState,
  reducers: {
    teamLBACLoaded: (state: TeamLBACState, action: PayloadAction<TeamLBACConfig>): TeamLBACState => ({
      ...state,
      teamLBACConfig: action.payload,
    }),
  },
});

export const { teamLBACLoaded } = teamLBACSlice.actions;

export const reducer = teamLBACSlice.reducer;

export const teamLBACReducer = {
  teamLBAC: reducer,
};
