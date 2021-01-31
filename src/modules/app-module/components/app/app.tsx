import React, { FC } from 'react';
import './app.scss';
import { GantChart } from '../../../gantt-chart-module/components/gantt-chart/gantt-chart';
import { AutoServiceSelection } from '../../../auto-service-module/components/auto-service-selection/auto-service-selection';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store/root.reducer';

export const App: FC = (): JSX.Element => {
  const { selectedAutoService } = useSelector((state: RootState) => state.autoService);

  return <div className='app'>{selectedAutoService.id ? <GantChart /> : <AutoServiceSelection />}</div>;
};
