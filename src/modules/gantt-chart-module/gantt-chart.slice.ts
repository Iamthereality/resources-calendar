import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GanttChartRowInterface } from '../../core/models/gantt-chart.inteface';

interface GanttChartSliceInterface {
  chartIsLoading: boolean;
  selectedRecord: any;
  rows: GanttChartRowInterface[];
}

const initialState: GanttChartSliceInterface = {
  chartIsLoading: true,
  selectedRecord: [],
  rows: []
};

export const ganttChartSlice = createSlice({
  name: 'ganttChartSlice',
  initialState,
  reducers: {
    setChartIsLoading(state, action: PayloadAction<boolean>) {
      state.chartIsLoading = action.payload;
    },
    getRows() {},
    setSelectedRecord(state, action: PayloadAction<any>) {
      state.selectedRecord = action.payload;
    },
    resetSelectedRecord(state) {
      state.selectedRecord = initialState.selectedRecord;
    }
  }
});

export const { getRows, setSelectedRecord, resetSelectedRecord, setChartIsLoading } = ganttChartSlice.actions;

export const ganttChartReducer = ganttChartSlice.reducer;
