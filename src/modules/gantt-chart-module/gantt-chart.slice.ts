import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GanttChartRowInterface } from '../../core/models/gantt-chart.inteface';

interface GanttChartSliceInterface {
  selectedRecord: any;
  rows: GanttChartRowInterface[];
}

const initialState: GanttChartSliceInterface = {
  selectedRecord: [],
  rows: []
};

export const ganttChartSlice = createSlice({
  name: 'ganttChartSlice',
  initialState,
  reducers: {
    getRows() {},
    setSelectedRecord(state, action: PayloadAction<any>) {
      state.selectedRecord = action.payload;
    },
    resetSelectedRecord(state) {
      state.selectedRecord = initialState.selectedRecord;
    }
  }
});

export const { getRows, setSelectedRecord, resetSelectedRecord } = ganttChartSlice.actions;

export const ganttChartReducer = ganttChartSlice.reducer;
