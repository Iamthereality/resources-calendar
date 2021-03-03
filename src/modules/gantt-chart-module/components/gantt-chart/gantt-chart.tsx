import { FC, useEffect } from 'react';
import './gantt-chart.scss';
import { Chart } from '../../../../shared/components/chart/chart';
import { getServiceResources, resetSelectedAutoService } from '../../../auto-service-module/auto-service.slice';
import { setChartIsLoading, closeDeal, setChartDataReloading } from '../../gantt-chart.slice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../core/store/root.reducer';
import { LoadingIndicator } from '../../../../shared/components/loading-indicator/loading-indicator';
import { SideBar } from '../side-bar/side-bar';

export const GantChart: FC = () => {
  const dispatch = useDispatch();
  const { chartIsLoading, reloadChartData, sideBarState, chartZoom } = useSelector(
    (state: RootState) => state.ganttChart
  );

  useEffect(() => {
    dispatch(getServiceResources());
  }, [dispatch, reloadChartData]);

  return chartIsLoading ? (
    <LoadingIndicator />
  ) : (
    <>
      <div className='layout'>
        <div
          className='back'
          onClick={() => {
            dispatch(resetSelectedAutoService());
            dispatch(setChartIsLoading(true));
            dispatch(closeDeal());
          }}
        >
          Назад
        </div>
        <div
          className={sideBarState ? 'reload' : 'reload__sidebar'}
          onClick={() => {
            dispatch(setChartDataReloading(true));
          }}
        >
          Обновить
        </div>
        <div className={sideBarState ? 'charts sidebar__open' : 'charts sidebar__closed'}>
          <div className='charts__top'>
            <Chart chartTitle={'Приёмщики'} isAcceptor={true} chartZoom={chartZoom} />
          </div>
          <div className='charts__bottom'>
            <Chart chartTitle={'Механики'} isAcceptor={false} chartZoom={chartZoom} />
          </div>
        </div>
        {sideBarState ? <SideBar /> : null}
      </div>
    </>
  );
};
