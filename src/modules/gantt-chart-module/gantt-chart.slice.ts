import { createSlice } from '@reduxjs/toolkit';
import { GanttChartRowInterface } from '../../core/models/gantt-chart.inteface';

interface GanttChartSliceInterface {
  rows: GanttChartRowInterface[];
}

const initialState: GanttChartSliceInterface = {
  rows: []
};

export const ganttChartSlice = createSlice({
  name: 'ganttChartSlice',
  initialState,
  reducers: {
    getRows() {}
  }
});

export const { getRows } = ganttChartSlice.actions;

export const ganttChartReducer = ganttChartSlice.reducer;
