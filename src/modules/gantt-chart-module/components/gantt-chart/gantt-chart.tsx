import React, { FC, useEffect } from 'react';
import './gantt-chart.scss';
import { Chart } from '../../../../shared/components/chart/chart';
import { getServiceResources, resetSelectedAutoService } from '../../../auto-service-module/auto-service.slice';
import { setChartIsLoading } from '../../gantt-chart.slice';
import { useDispatch, useSelector } from 'react-redux';
import { ModalWindow } from '../../../../shared/components/modal-window/modal-window';
import { NewRecord } from '../new-record/new-record';
import { RootState } from '../../../../core/store/root.reducer';
import { LoadingIndicator } from '../../../../shared/components/loading-indicator/loading-indicator';

export const GantChart: FC = () => {
  const dispatch = useDispatch();
  const { acceptors, mechanics, deals } = useSelector((state: RootState) => state.autoService);
  const { chartIsLoading } = useSelector((state: RootState) => state.ganttChart);

  useEffect(() => {
    dispatch(getServiceResources());
  }, [dispatch]);

  return chartIsLoading ? (
    <LoadingIndicator />
  ) : (
    <>
      <ModalWindow>
        <NewRecord />
      </ModalWindow>
      <div
        className='navigate-back'
        onClick={() => {
          dispatch(resetSelectedAutoService());
          dispatch(setChartIsLoading(true));
        }}
      >
        Назад
      </div>
      <div className='charts'>
        <div className='charts__top'>
          <Chart chartTitle={'Приёмщики'} employees={acceptors} deals={deals} />
        </div>
        <div className='charts__bottom'>
          <Chart chartTitle={'Механики'} employees={mechanics} deals={deals} />
        </div>
      </div>
    </>
  );
};
