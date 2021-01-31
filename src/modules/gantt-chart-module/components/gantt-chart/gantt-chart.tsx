import React, { FC, useEffect } from 'react';
import './gantt-chart.scss';
import { Chart } from '../../../../shared/components/chart/chart';
import { getServiceResources, resetSelectedAutoService } from '../../../auto-service-module/auto-service.slice';
import { useDispatch, useSelector } from 'react-redux';
import { ModalWindow } from '../../../../shared/components/modal-window/modal-window';
import { NewRecord } from '../new-record/new-record';
import { RootState } from '../../../../core/store/root.reducer';
import { LoadingIndicator } from '../../../../shared/components/loading-indicator/loading-indicator';

export const GantChart: FC = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.autoService);

  useEffect(() => {
    dispatch(getServiceResources());
  }, []);

  return loading ? (
    <LoadingIndicator />
  ) : (
    <>
      <ModalWindow>
        <NewRecord />
      </ModalWindow>
      <div className='navigate-back' onClick={() => dispatch(resetSelectedAutoService())}>
        Назад
      </div>
      <div className='charts'>
        <div className='charts__top'>
          <Chart chartTitle={'Приёмщики'} />
        </div>
        <div className='charts__bottom'>
          <Chart chartTitle={'Механики'} />
        </div>
      </div>
    </>
  );
};
