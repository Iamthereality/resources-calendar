import { FC, useCallback, useEffect, useRef, useState } from 'react';
import './chart.scss';
import * as echarts from 'echarts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store/root.reducer';
import { openDeal } from '../../../modules/gantt-chart-module/gantt-chart.slice';
import {
  DealInterface,
  EmployeeInterface,
  EmployeeScheduleInterface,
  ProvidedService
} from '../../../core/models/auto-service.interface';
import { ChartZoomInterface } from '../../../core/models/gantt-chart.inteface';

declare class ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

// @ts-ignore
const resizeObserver = new ResizeObserver((entries) => {
  entries.map(({ target }) => {
    const instance = echarts.getInstanceByDom(target);
    return instance.resize();
  });
});

interface Props {
  chartTitle: string;
  isAcceptor: boolean;
  chartZoom: ChartZoomInterface;
  setChartZoom: (start: number, end: number) => void;
  dealId: string;
  setDealId: (id: string | null) => void;
}

interface ChartDataInterface {
  employee: {
    dimensions: string[];
    data: any[];
  };
  deal: {
    dimensions: string[];
    data: any[];
  };
}

interface DaysOffInterface {
  dimensions: string[];
  data: any[];
}

export const Chart: FC<Props> = ({ chartTitle, isAcceptor, chartZoom, setChartZoom, dealId, setDealId }) => {
  const dispatch = useDispatch();

  const { acceptors, mechanics, providedServices, deals } = useSelector((state: RootState) => state.autoService);

  const eChart = useRef(null);
  const chart = useRef(null);

  const CATEGORY_INDEX = 0;
  const START_DATE = 6;
  const END_DATE = 7;

  const renderAxisLabelItem = (params, api) => {
    const y = api.coord([0, api.value(0)])[1];

    return {
      type: 'group',
      position: [10, y],
      children: [
        {
          type: 'path',
          shape: {
            d: 'M -30 0 L -30 -20 L 30 -20 C 42 -20 38 -1 50 -1 L 52 -1 L 52 0 Z',
            x: 0,
            y: -40,
            width: 190,
            height: 40,
            layout: 'cover'
          },
          style: {
            fill: '#368c6c'
          }
        },
        {
          type: 'text',
          style: {
            x: 80,
            y: -20,
            text: `${api.value(1)} ${api.value(2)}`,
            textVerticalAlign: 'center',
            textAlign: 'center',
            textFill: '#fff'
          }
        }
      ]
    };
  };

  const clipRectByRect = (params, rect) => {
    return echarts.graphic.clipRectByRect(rect, {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    });
  };

  const renderRecord = useCallback(
    (params, api, { index, start, end }, isDayOff?: boolean) => {
      const categoryIndex = api.value(index);
      const startDate = api.coord([api.value(start), categoryIndex]);
      const endDate = api.coord([api.value(end), categoryIndex]);

      const barWidth = endDate[0] - startDate[0];
      const barHeight = api.size([0, 1])[1] * 0.7 < 51 ? 50 : api.size([0, 1])[1] * 0.7;
      const x = startDate[0];
      const y = startDate[1] - barHeight;

      const title = api.value(1);
      // @ts-ignore
      const titleWidth = echarts.format.getTextRect(title).width;
      const text =
        barWidth > titleWidth + 20 && x + barWidth >= 180
          ? !isDayOff
            ? isAcceptor
              ? '\u2191'
              : title
            : 'Выходной'
          : '';

      const rectNormal = clipRectByRect(params, {
        x: x,
        y: y,
        width: barWidth,
        height: barHeight
      });

      const rectText = clipRectByRect(params, {
        x: x,
        y: y,
        width: barWidth,
        height: barHeight
      });

      return {
        type: 'group',
        children: [
          {
            type: 'rect',
            ignore: !rectNormal,
            shape: rectNormal,
            style:
              api.value(2) === 'C1:WON'
                ? { fill: '#36d18e' }
                : +dealId === api.value(8)
                ? {
                    fill: '#ffae00',
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                  }
                : {
                    fill: isDayOff
                      ? 'rgba(0, 0, 0, 0.25)'
                      : api.value(9) === 'accept'
                      ? '#ff0080'
                      : api.value(9) === 'release'
                      ? '#9d00ff'
                      : '#4d70c3'
                  }
          },
          {
            type: 'rect',
            ignore: !rectText,
            shape: rectText,
            style: {
              fill: 'transparent',
              stroke: 'transparent',
              text: text,
              textFill: +dealId === api.value(8) ? '#000' : '#fff'
            }
          }
        ]
      };
    },
    [isAcceptor, dealId]
  );

  const renderDaysOff = useCallback(
    (params, api) => {
      return renderRecord(params, api, { index: 0, start: 3, end: 4 }, true);
    },
    [renderRecord]
  );

  const renderGanttItem = useCallback(
    (params, api) => {
      return renderRecord(params, api, { index: CATEGORY_INDEX, start: START_DATE, end: END_DATE });
    },
    [renderRecord]
  );

  const setEmployeesData = useCallback((): any[] => {
    return isAcceptor
      ? acceptors.map((employee: EmployeeInterface, index: number) => [index, employee.name, employee.lastName])
      : mechanics.map((employee: EmployeeInterface, index: number) => [index, employee.name, employee.lastName]);
  }, [acceptors, mechanics, isAcceptor]);

  const setDaysOff = useCallback(() => {
    const formatDate = (date: string): Date => {
      const dateParts = date.split('.');
      return new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
    };

    return isAcceptor
      ? acceptors
          .map((employee: EmployeeInterface, index: number) => [
            employee.schedule.map((dayOff: EmployeeScheduleInterface) => [
              index,
              employee.name,
              employee.lastName,
              formatDate(dayOff.from),
              formatDate(dayOff.to)
            ])
          ])
          .flat()
      : mechanics
          .map((employee: EmployeeInterface, index: number) => [
            employee.schedule.map((dayOff: EmployeeScheduleInterface) => [
              index,
              employee.name,
              employee.lastName,
              formatDate(dayOff.from),
              formatDate(dayOff.to)
            ])
          ])
          .flat();
  }, [acceptors, mechanics, isAcceptor]);

  const setDealsData = useCallback((): any[] => {
    if (isAcceptor) {
      const acceptorDeals = [];
      deals.forEach((deal: DealInterface) => {
        const acceptor: EmployeeInterface = acceptors.filter(
          (acceptor: EmployeeInterface) => acceptor.id === deal.acceptorId.toString()
        )[0];
        const mechanic: EmployeeInterface = mechanics.filter(
          (mechanic: EmployeeInterface) => mechanic.id === deal.mechanicId.toString()
        )[0];
        const service: ProvidedService = providedServices.filter(
          (service: ProvidedService) => service.id === deal.providedServiceId.toString()
        )[0];
        const commonFields = [
          acceptors.findIndex((employee: EmployeeInterface) => acceptor.id === employee.id),
          deal.title,
          deal.status,
          `${acceptor.name} ${acceptor.lastName}`,
          `${mechanic.name} ${mechanic.lastName}`,
          service.name
        ];
        const start = [...commonFields, Date.parse(deal.accept), Date.parse(deal.accept) + 600000, deal.id, 'accept'];
        const end = [...commonFields, Date.parse(deal.release) - 600000, Date.parse(deal.release), deal.id, 'release'];
        acceptorDeals.push(start, end);
      });
      return acceptorDeals;
    } else {
      return deals.map((deal: DealInterface) => {
        const acceptor: EmployeeInterface = acceptors.filter(
          (acceptor: EmployeeInterface) => acceptor.id === deal.acceptorId.toString()
        )[0];
        const mechanic: EmployeeInterface = mechanics.filter(
          (mechanic: EmployeeInterface) => mechanic.id === deal.mechanicId.toString()
        )[0];
        const service: ProvidedService = providedServices.filter(
          (service: ProvidedService) => service.id === deal.providedServiceId.toString()
        )[0];
        return [
          mechanics.findIndex((employee: EmployeeInterface) => mechanic.id === employee.id),
          deal.title,
          deal.status,
          `${acceptor.name} ${acceptor.lastName}`,
          `${mechanic.name} ${mechanic.lastName}`,
          service.name,
          new Date(deal.start),
          new Date(deal.end),
          deal.id,
          'service'
        ];
      });
    }
  }, [acceptors, mechanics, isAcceptor, deals, providedServices]);

  const [chartData, setChartData] = useState<ChartDataInterface>({
    employee: {
      dimensions: ['index', 'Имя', 'Фамилия'],
      data: setEmployeesData()
    },
    deal: {
      dimensions: [
        'index',
        'Сделка',
        'Стату сделки',
        'Приёмщик',
        'Механик',
        'Услуга',
        'Начало обслуживания',
        'Конец обслуживания',
        'id',
        'stage'
      ],
      data: setDealsData()
    }
  });

  const [daysOffData, setDaysOffData] = useState<DaysOffInterface>({
    dimensions: ['index', 'Имя', 'Фамилия', 'Выходной с:', 'Выходной по:'],
    data: setDaysOff().flat()
  });

  useEffect(() => {
    chart.current = echarts.init(eChart.current);
    chart.current.on('mouseover', (params) => {
      if (params.value[8]) {
        setDealId(params.value[8]);
      }
    });
    chart.current.on('mouseout', (params) => {
      if (params.value[8]) {
        setDealId(null);
      }
    });
    chart.current.on('dataZoom', (params) => {
      const zoomId = (dataZoomId): string => {
        let id = '';
        for (let i = 0; i < dataZoomId.length; i++) {
          if (dataZoomId.charCodeAt(i) !== 0) {
            id += dataZoomId.charAt(i);
          }
        }
        return id;
      };

      if (params.hasOwnProperty('batch')) {
        if (params.batch[0].hasOwnProperty('dataZoomId')) {
          if (zoomId(params.batch[0].dataZoomId) === 'series20') {
            setChartZoom(params.batch[0].start, params.batch[0].end);
          }
        }
      } else {
        if (params.hasOwnProperty('dataZoomId')) {
          if (zoomId(params.dataZoomId) === 'series00') {
            setChartZoom(params.start, params.end);
          }
        }
      }
    });
    chart.current.getZr().on('click', (params) => {
      if (!params.target) {
        dispatch(openDeal(null));
      }
    });
    resizeObserver.observe(eChart.current);
  }, [dispatch, setChartZoom, setDealId]);

  useEffect(() => {
    setChartData((state: ChartDataInterface) => ({
      employee: {
        dimensions: state.employee.dimensions,
        data: setEmployeesData()
      },
      deal: {
        dimensions: state.deal.dimensions,
        data: setDealsData()
      }
    }));
    setDaysOffData((state: DaysOffInterface) => ({
      dimensions: state.dimensions,
      data: setDaysOff().flat()
    }));
    chart.current.setOption({
      tooltip: {},
      animation: false,
      title: {
        text: chartTitle,
        left: 'center'
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          start: chartZoom.start,
          end: chartZoom.end,
          filterMode: 'weakFilter',
          showDetail: false
        },
        {
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'weakFilter',
          showDetail: false
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          minValueSpan: 3600,
          filterMode: 'weakFilter',
          showDetail: false,
          zoomOnMouseWheel: false,
          moveOnMouseMove: true
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          filterMode: 'weakFilter',
          zoomOnMouseWheel: false,
          moveOnMouseMove: true,
          moveOnMouseWheel: true
        }
      ],
      grid: {
        show: true,
        top: 60,
        bottom: 50,
        left: 200,
        right: 45,
        backgroundColor: '#fff',
        borderWidth: 0
      },
      xAxis: {
        type: 'time',
        position: 'top',
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#E9EDFF']
          }
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#929ABA',
          inside: false,
          align: 'center'
        }
      },
      yAxis: {
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#E9EDFF']
          }
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        min: 0,
        max: chartData.employee.data.length
      },
      series: [
        {
          type: 'custom',
          renderItem: renderDaysOff,
          dimensions: daysOffData.dimensions,
          encode: {
            x: [3, 4],
            y: 0,
            tooltip: [1, 2, 3, 4]
          },
          data: daysOffData.data
        },
        {
          type: 'custom',
          renderItem: renderGanttItem,
          dimensions: chartData.deal.dimensions,
          encode: {
            x: [START_DATE, END_DATE],
            y: CATEGORY_INDEX,
            tooltip: [1, 3, 4, 5, 6, 7]
          },
          data: chartData.deal.data
        },
        {
          type: 'custom',
          renderItem: renderAxisLabelItem,
          dimensions: chartData.employee.dimensions,
          encode: {
            tooltip: [1, 2],
            x: -1,
            y: 0
          },
          data: chartData.employee.data
        }
      ]
    });
    chart.current.on('click', (params) => {
      if (params) {
        const selectedDeal = deals.filter((deal: DealInterface) => deal.id === params.value[8])[0];
        dispatch(openDeal(selectedDeal));
      }
    });
    // eslint-disable-next-line
  }, [dispatch, chartTitle, renderGanttItem, setEmployeesData, setDealsData, setChartData, setDaysOffData, deals]);

  useEffect(() => {
    chart.current.setOption({
      dataZoom: [
        {
          xAxisIndex: 0,
          start: chartZoom.start,
          end: chartZoom.end
        },
        {
          yAxisIndex: 0
        }
      ]
    });
  }, [chartZoom]);

  return <div ref={eChart} className='chart' />;
};
