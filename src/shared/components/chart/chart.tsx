import { FC, useCallback, useEffect, useRef, useState } from 'react';
import './chart.scss';
import * as echarts from 'echarts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store/root.reducer';
import { openDeal } from '../../../modules/gantt-chart-module/gantt-chart.slice';
import { DealInterface, EmployeeInterface, ProvidedService } from '../../../core/models/auto-service.interface';

export declare class ResizeObserver {
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
}

interface ChartDataInterface {
  employee: {
    dimensions: any[];
    data: any[];
  };
  deal: {
    dimensions: any[];
    data: any[];
  };
}

export const Chart: FC<Props> = ({ chartTitle, isAcceptor }) => {
  const dispatch = useDispatch();

  const { acceptors, mechanics, providedServices, deals } = useSelector((state: RootState) => state.autoService);

  const eChart = useRef(null);

  const HEIGHT_RATIO = 0.6;
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
            y: -20,
            width: 180,
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
            y: 0,
            text: `${api.value(1)} ${api.value(2)} `,
            textVerticalAlign: 'center',
            textAlign: 'center',
            textFill: '#fff'
          }
        }
      ]
    };
  };

  const clipRectByRect = (params, rect) => {
    // @ts-ignore
    return echarts.graphic.clipRectByRect(rect, {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    });
  };

  const renderGanttItem = useCallback((params, api) => {
    const categoryIndex = api.value(CATEGORY_INDEX);
    const startDate = api.coord([api.value(START_DATE), categoryIndex]);
    const endDate = api.coord([api.value(END_DATE), categoryIndex]);

    const barWidth = endDate[0] - startDate[0];
    const barHeight = api.size([0, 1])[1] * HEIGHT_RATIO;
    const x = startDate[0];
    const y = startDate[1] - barHeight;

    const title = api.value(1) + '';
    // @ts-ignore
    const titleWidth = echarts.format.getTextRect(title).width;
    const text = barWidth > titleWidth + 40 && x + barWidth >= 180 ? title : '';

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

    const path = {
      d:
        'M129.007,57.819c-4.68-4.68-12.499-4.68-17.191,0L3.555,165.803c-4.74,4.74-4.74,12.427,0,17.155\n' +
        '\t\tc4.74,4.74,12.439,4.74,17.179,0l99.683-99.406l99.671,99.418c4.752,4.74,12.439,4.74,17.191,0c4.74-4.74,4.74-12.427,0-17.155\n' +
        '\t\tL129.007,57.819z',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      layout: 'cover'
    };

    return {
      type: 'group',
      children: [
        {
          type: 'rect',
          ignore: !rectNormal,
          shape: rectNormal,
          style:
            api.value(2) === 'C1:WON'
              ? {
                  fill: '#36d18e',
                  stroke: '#fff',
                  lineWidth: 2
                }
              : {
                  fill: '#4d70c3',
                  stroke: '#fff',
                  lineWidth: 2
                }
        },
        {
          type: 'path',
          shape: path,
          style: {
            fill: '#fff'
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
            textFill: '#fff'
          }
        }
      ]
    };
  }, []);

  const setEmployeesData = useCallback((): any[] => {
    return isAcceptor
      ? acceptors.map((employee: EmployeeInterface, index: number) => [index, employee.name, employee.lastName])
      : mechanics.map((employee: EmployeeInterface, index: number) => [index, employee.name, employee.lastName]);
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
        const start = [...commonFields, Date.parse(deal.start), Date.parse(deal.start) + 900000, deal.id];
        const end = [...commonFields, Date.parse(deal.end) - 900000, Date.parse(deal.end), deal.id];
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
          deal.id
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
        'id'
      ],
      data: setDealsData()
    }
  });

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
    const chart = echarts.init(eChart.current);
    chart.setOption({
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
          filterMode: 'weakFilter',
          showDetail: false,
          minSpan: 10
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
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'weakFilter'
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
        axisLine: {
          show: false
        },
        axisTick: {
          lineStyle: {
            color: '#929ABA'
          }
        },
        axisLabel: {
          color: '#929ABA',
          inside: false,
          align: 'center'
        }
      },
      yAxis: {
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#E9EDFF']
          }
        },
        axisLine: { show: false },
        axisLabel: { show: false },
        min: 0,
        max: chartData.employee.data.length
      },
      series: [
        {
          id: 'deals',
          type: 'custom',
          renderItem: renderGanttItem,
          dimensions: chartData.deal.dimensions,
          encode: {
            x: [START_DATE, END_DATE],
            y: CATEGORY_INDEX,
            tooltip: [1, 2, 3, 4, 5, 6, 7]
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
    chart.on('click', (param) => {
      if (param) {
        // @ts-ignore
        const selectedDeal = deals.filter((deal: DealInterface) => deal.id === param.value[8])[0];
        dispatch(openDeal(selectedDeal));
      }
    });
    chart.getZr().on('click', (params) => {
      if (!params.target) {
        dispatch(openDeal(null));
      }
    });
    resizeObserver.observe(eChart.current);
    // eslint-disable-next-line
  }, [chartTitle, renderGanttItem, setEmployeesData, setDealsData, setChartData]);

  return <div ref={eChart} className='chart' />;
};
