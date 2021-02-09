import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DealInterface } from '../../core/models/auto-service.interface';

interface GanttChartSliceInterface {
  chartIsLoading: boolean;
  selectedRecord: DealInterface;
  newRecord: boolean;
}

const initialState: GanttChartSliceInterface = {
  chartIsLoading: true,
  selectedRecord: {} as DealInterface,
  newRecord: false
};

export const ganttChartSlice = createSlice({
  name: 'ganttChartSlice',
  initialState,
  reducers: {
    setChartIsLoading(state, action: PayloadAction<boolean>) {
      state.chartIsLoading = action.payload;
    },
    setSelectedRecord(state, action: PayloadAction<DealInterface>) {
      state.selectedRecord = action.payload;
    },
    resetSelectedRecord(state) {
      state.selectedRecord = initialState.selectedRecord;
    },
    setNewRecord(state, action: PayloadAction<boolean>) {
      state.newRecord = action.payload;
    },
    resetNewRecord(state) {
      state.newRecord = initialState.newRecord;
    }
  }
});

export const {
  setSelectedRecord,
  resetSelectedRecord,
  setChartIsLoading,
  setNewRecord,
  resetNewRecord
} = ganttChartSlice.actions;

export const ganttChartReducer = ganttChartSlice.reducer;
