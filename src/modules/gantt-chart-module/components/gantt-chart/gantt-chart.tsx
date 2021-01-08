import React, { FC } from 'react';
import './gantt-chart.scss';
import { Chart } from '../../../../shared/components/chart/chart';
import { resetSelectedAutoService } from '../../../auto-service-module/auto-service.slice';

import { useDispatch } from 'react-redux';

export const GantChart: FC = () => {
  const dispatch = useDispatch();

  return (
    <>
      <div className='navigate-back' onClick={() => dispatch(resetSelectedAutoService())}>
        Назад
      </div>
      <Chart />
    </>
  );
};
