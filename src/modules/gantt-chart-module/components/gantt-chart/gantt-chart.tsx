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
import {
  DealInterface,
  EmployeeInterface,
  EmployeeScheduleInterface
} from '../../../../core/models/auto-service.interface';

export const GantChart: FC = () => {
  const dispatch = useDispatch();
  const { chartIsLoading, reloadChartData, sideBarState } = useSelector((state: RootState) => state.ganttChart);
  const { deals, acceptors, mechanics } = useSelector((state: RootState) => state.autoService);

  const [dealId, setId] = useState<string | null>(null);

  const [chartZoom, setZoom] = useState<ChartZoomInterface>({} as ChartZoomInterface);

  const [minDealDate, setMinDealDate] = useState<number>(null);
  const [maxDealDate, setMaxDealDate] = useState<number>(null);

  const [minEmployeeDayOff, setMinEmployeeDayOff] = useState<number>(null);
  const [maxEmployeeDayOff, setMaxEmployeeDayOff] = useState<number>(null);

  const [minTime, setMinTime] = useState<number>(null);
  const [maxTime, setMaxTime] = useState<number>(null);

  const setDealId = useCallback((id: string | null): void => {
    setId(id);
  }, []);

  const setChartZoom = useCallback((start: number, end: number): void => {
    setZoom({ start, end });
  }, []);

  const getTargetDate = useCallback(
    (targetDateName: string): number[] =>
      deals
        .filter((deal: DealInterface) => Object.keys(deal).filter((key: string) => key === targetDateName))
        .map((deal: DealInterface) => new Date(deal[targetDateName]).getTime()),
    [deals]
  );

  useEffect(() => {
    dispatch(getServiceResources());
  }, [dispatch, reloadChartData]);

  useEffect(() => {
    if (deals && acceptors && mechanics && chartIsLoading) {
      setMinDealDate(Math.min(...getTargetDate('accept')));
      setMaxDealDate(Math.max(...getTargetDate('release')));
      const getEmployeeSchedule = (employees: EmployeeInterface[]): EmployeeScheduleInterface[] => {
        return employees.map((employee: EmployeeInterface) => employee.schedule).flat();
      };
      const employeeDaysOff = [...getEmployeeSchedule(acceptors), ...getEmployeeSchedule(mechanics)];
      const getTargetDayOff = (target: string): number[] => {
        const formatDate = (date: string): Date => {
          const dateParts = date.split('.');
          return new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
        };
        return employeeDaysOff.map((day: EmployeeScheduleInterface) => new Date(formatDate(day[target])).getTime());
      };
      setMinEmployeeDayOff(Math.min(...getTargetDayOff('from')));
      setMaxEmployeeDayOff(Math.max(...getTargetDayOff('to')));
    }
  }, [
    deals,
    acceptors,
    mechanics,
    getTargetDate,
    setMinDealDate,
    setMaxDealDate,
    setMinEmployeeDayOff,
    setMaxEmployeeDayOff,
    reloadChartData,
    chartIsLoading
  ]);

  useEffect(() => {
    if (minDealDate && maxDealDate && minEmployeeDayOff && maxEmployeeDayOff && chartIsLoading) {
      setMinTime(Math.min(minDealDate, minEmployeeDayOff));
      setMaxTime(Math.max(maxDealDate, maxEmployeeDayOff));
      const halfOfAnHour = 1000 * 60 * 30;
      const now = new Date().getTime();
      const oneHourWindowStart = now - halfOfAnHour;
      const oneHourWindowEnd = now + halfOfAnHour;
      const normalizer = (value: number, min: number, max: number): number => {
        return ((value - min) / (max - min)) * 100;
      };
      setZoom({
        start: normalizer(oneHourWindowStart, minTime, maxTime),
        end: normalizer(oneHourWindowEnd, minTime, maxTime)
      });
    }
  }, [minDealDate, maxDealDate, minEmployeeDayOff, maxEmployeeDayOff, minTime, maxTime, chartIsLoading]);

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
