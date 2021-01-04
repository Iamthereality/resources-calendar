import React, { FC } from 'react';
import './app.scss';
import { GantChart } from '../../../gantt-chart-module/components/gantt-chart/gantt-chart';
import { OfficeSelection } from '../../../office-module/components/office-selection/office-selection';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store/root.reducer';

export const App: FC = (): JSX.Element => {
  const { selectedOffice } = useSelector((state: RootState) => state.office);

  return <div className='app'>{selectedOffice.id ? <GantChart /> : <OfficeSelection />}</div>;
};
