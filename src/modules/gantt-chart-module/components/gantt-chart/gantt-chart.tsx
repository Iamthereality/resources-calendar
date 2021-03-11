import { FC, useCallback, useEffect, useState } from 'react';
import './gantt-chart.scss';
import { Chart } from '../../../../shared/components/chart/chart';
import { getServiceResources, resetSelectedAutoService } from '../../../auto-service-module/auto-service.slice';
import { setChartIsLoading, closeDeal, setChartDataReloading } from '../../gantt-chart.slice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../core/store/root.reducer';
import { LoadingIndicator } from '../../../../shared/components/loading-indicator/loading-indicator';
import { SideBar } from '../side-bar/side-bar';
import { ChartZoomInterface } from '../../../../core/models/gantt-chart.inteface';

export const GantChart: FC = () => {
  const dispatch = useDispatch();
  const { chartIsLoading, reloadChartData, sideBarState } = useSelector((state: RootState) => state.ganttChart);

  const [chartZoom, setZoom] = useState<ChartZoomInterface>({
    start: 0,
    end: 5
  });

  const [dealId, setId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getServiceResources());
  }, [dispatch, reloadChartData]);

  const setChartZoom = useCallback((start: number, end: number): void => {
    setZoom({ start, end });
  }, []);

  const setDealId = useCallback((id: string | null): void => {
    setId(id);
  }, []);

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
            <Chart
              chartTitle={'Приёмщики'}
              isAcceptor={true}
              chartZoom={chartZoom}
              setChartZoom={setChartZoom}
              dealId={dealId}
              setDealId={setDealId}
            />
          </div>
          <div className='charts__bottom'>
            <Chart
              chartTitle={'Механики'}
              isAcceptor={false}
              chartZoom={chartZoom}
              setChartZoom={setChartZoom}
              dealId={dealId}
              setDealId={setDealId}
            />
          </div>
        </div>
        {sideBarState ? <SideBar /> : null}
      </div>
    </>
  );
};
