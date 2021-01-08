import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppSliceInterface {
  loading: boolean;
}

const initialState: AppSliceInterface = {
  loading: true
};

export const appSlice = createSlice({
  name: 'appSlice',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    }
  }
});

export const { setLoading } = appSlice.actions;

export const appReducer = appSlice.reducer;
