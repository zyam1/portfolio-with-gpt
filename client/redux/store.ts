import { createSlice } from '@reduxjs/toolkit';

const pageSlices = createSlice({
  name: 'page',
  initialState: { pageName: {} },
  reducers: {
    setPage: (state, action) => {
      state.pageName = action.payload;
    },
  },
});

export const { setPage } = pageSlices.actions;
export default pageSlices.reducer;
