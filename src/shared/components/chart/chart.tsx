import React, { FC, useCallback, useEffect, useRef } from 'react';
import './chart.scss';
import * as echarts from 'echarts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store/root.reducer';
import { setSelectedRecord } from '../../../modules/gantt-chart-module/gantt-chart.slice';
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

const HEIGHT_RATIO = 0.6;
const CATEGORY_INDEX = 0;
const START_DATE = 1;
const END_DATE = 2;
const DATA_ZOOM_AUTO_MOVE_THROTTLE = 30;
const DATA_ZOOM_X_INSIDE_INDEX = 1;
const DATA_ZOOM_Y_INSIDE_INDEX = 3;
const DATA_ZOOM_AUTO_MOVE_SPEED = 0.2;
const DATA_ZOOM_AUTO_MOVE_DETECT_AREA_WIDTH = 30;

let draggable = true;
let draggingEl;
let dropShadow;
let draggingCursorOffset = [0, 0];
let draggingTimeLength;
let draggingRecord;
let dropRecord;
let autoDataZoomAnimator;

let cartesianXBounds = [];
let cartesianYBounds = [];

const renderGanttItem = (params, api) => {
  const categoryIndex = api.value(CATEGORY_INDEX);
  const timeArrival = api.coord([api.value(START_DATE), categoryIndex]);
  const timeDeparture = api.coord([api.value(END_DATE), categoryIndex]);

  const coordSys = params.coordSys;
  cartesianXBounds[0] = coordSys.x;
  cartesianXBounds[1] = coordSys.x + coordSys.width;
  cartesianYBounds[0] = coordSys.y;
  cartesianYBounds[1] = coordSys.y + coordSys.height;

  const barLength = timeDeparture[0] - timeArrival[0];
  // Get the height corresponds to length 1 on y axis.
  const barHeight = api.size([0, 1])[1] * HEIGHT_RATIO;
  const x = timeArrival[0];
  const y = timeArrival[1] - barHeight;

  const flightNumber = api.value(3) + '';
  // @ts-ignore
  const flightNumberWidth = echarts.format.getTextRect(flightNumber).width;
  const text = barLength > flightNumberWidth + 40 && x + barLength >= 180 ? flightNumber : '';

  const rectNormal = clipRectByRect(params, {
    x: x,
    y: y,
    width: barLength,
    height: barHeight
  });

  const rectText = clipRectByRect(params, {
    x: x,
    y: y,
    width: barLength,
    height: barHeight
  });

  return {
    type: 'group',
    children: [
      {
        type: 'rect',
        ignore: !rectNormal,
        shape: rectNormal,
        style: api.style()
      },
      {
        type: 'rect',
        ignore: !rectText,
        shape: rectText,
        style: api.style({
          fill: 'transparent',
          stroke: 'transparent',
          text: text,
          textFill: '#fff'
        })
      }
    ]
  };
};

const renderAxisLabelItem = (params, api) => {
  console.log(api.value(0));
  console.log(api.value(1));
  console.log(api.value(2));
  const y = api.coord([0, api.value(0)])[1];

  if (y < params.coordSys.y + 5) {
    return;
  }

  return {
    type: 'group',
    position: [10, y],
    children: [
      {
        type: 'path',
        shape: {
          // d: 'M0,0 L0,-20 L30,-20 C42,-20 38,-1 50,-1 L70,-1 L70,0 Z',
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

interface Props {
  chartTitle: string;
  employees: EmployeeInterface[];
  deals: DealInterface[];
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

export const Chart: FC<Props> = ({ chartTitle, employees, deals }) => {
  const dispatch = useDispatch();
  const { acceptors, mechanics, providedServices } = useSelector((state: RootState) => state.autoService);
  const eChart = useRef(null);
  const chartData: ChartDataInterface = {
    employee: {
      dimensions: ['index', 'Имя', 'Фамилия'],
      data: employees.map((employee: EmployeeInterface, index: number) => [index, employee.name, employee.lastName])
    },
    deal: {
      dimensions: ['Сделка', 'Приёмщик', 'Механик', 'Услуга', 'Начало обслуживания', 'Конец обслуживания'],
      data: deals.map((deal: DealInterface) => {
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
          deal.title,
          `${acceptor.name} ${acceptor.lastName}`,
          `${mechanic.name} ${mechanic.lastName}`,
          service.name,
          deal.start,
          deal.end
        ];
      })
    }
  };

  const initDrag = useCallback(
    (eChart) => {
      const makeAnimator = (callback) => {
        let requestId;
        let callbackParams;
        // Use throttle to prevent from calling dispatchAction frequently.
        // @ts-ignore
        callback = echarts.throttle(callback, DATA_ZOOM_AUTO_MOVE_THROTTLE);

        const onFrame = () => {
          callback(callbackParams);
          requestId = requestAnimationFrame(onFrame);
        };

        return {
          start: (params) => {
            callbackParams = params;
            if (requestId == null) {
              onFrame();
            }
          },
          stop: () => {
            if (requestId != null) {
              cancelAnimationFrame(requestId);
            }
            requestId = callbackParams = null;
          }
        };
      };

      const dispatchDataZoom = (params) => {
        const option = eChart.getOption();
        const optionInsideX = option.dataZoom[DATA_ZOOM_X_INSIDE_INDEX];
        const optionInsideY = option.dataZoom[DATA_ZOOM_Y_INSIDE_INDEX];
        const batch = [];

        const prepareBatch = (batch, id, start, end, cursorDist) => {
          if (cursorDist === 0) {
            return;
          }
          const sign = cursorDist / Math.abs(cursorDist);
          const size = end - start;
          const delta = DATA_ZOOM_AUTO_MOVE_SPEED * sign;

          start += delta;
          end += delta;

          if (end > 100) {
            end = 100;
            start = end - size;
          }
          if (start < 0) {
            start = 0;
            end = start + size;
          }
          batch.push({
            dataZoomId: id,
            start: start,
            end: end
          });
        };

        prepareBatch(batch, 'insideX', optionInsideX.start, optionInsideX.end, params.cursorDistX);
        prepareBatch(batch, 'insideY', optionInsideY.start, optionInsideY.end, -params.cursorDistY);

        batch.length &&
          eChart.dispatchAction({
            type: 'dataZoom',
            batch: batch
          });
      };

      autoDataZoomAnimator = makeAnimator(dispatchDataZoom);

      eChart.on('mousedown', (param) => {
        if (!draggable || !param || param.seriesIndex === null) {
          return;
        }

        const arr = chartData.deal.dimensions.map((dimension: string, index: number) => ({
          dimension,
          value: param.value[index]
        }));
        dispatch(setSelectedRecord(arr));

        // Drag start
        draggingRecord = {
          dataIndex: param.dataIndex,
          categoryIndex: param.value[CATEGORY_INDEX],
          timeArrival: param.value[START_DATE],
          timeDeparture: param.value[END_DATE]
        };
        const style = { lineWidth: 2, fill: 'rgba(255,0,0,0.1)', stroke: 'rgba(255,0,0,0.8)', lineDash: [6, 3] };

        draggingEl = addOrUpdateBar(draggingEl, draggingRecord, style, 100);
        draggingCursorOffset = [
          draggingEl.position[0] - param.event.offsetX,
          draggingEl.position[1] - param.event.offsetY
        ];
        draggingTimeLength = draggingRecord.timeDeparture - draggingRecord.timeArrival;
      });

      eChart.getZr().on('mousemove', (event) => {
        if (!draggingEl) {
          return;
        }

        const cursorX = event.offsetX;
        const cursorY = event.offsetY;

        // Move draggingEl.
        draggingEl.attr('x', draggingCursorOffset[0] + cursorX);
        draggingEl.attr('y', draggingCursorOffset[1] + cursorY);

        prepareDrop();

        autoDataZoomWhenDraggingOutside(cursorX, cursorY);
      });

      eChart.getZr().on('mouseup', (params) => {
        // Drop
        if (draggingEl && dropRecord) {
          updateRawData(params) &&
            eChart.setOption({
              series: {
                id: 'flightData',
                data: chartData.deal.data
              }
            });
        }
        dragRelease();
      });

      const dragRelease = () => {
        autoDataZoomAnimator.stop();

        if (draggingEl) {
          eChart.getZr().remove(draggingEl);
          draggingEl = null;
        }
        if (dropShadow) {
          eChart.getZr().remove(dropShadow);
          dropShadow = null;
        }
        dropRecord = draggingRecord = null;
      };

      const addOrUpdateBar = (el, itemData, style, z) => {
        const pointArrival = eChart.convertToPixel('grid', [itemData.timeArrival, itemData.categoryIndex]);
        const pointDeparture = eChart.convertToPixel('grid', [itemData.timeDeparture, itemData.categoryIndex]);

        const barLength = pointDeparture[0] - pointArrival[0];
        const barHeight =
          Math.abs(eChart.convertToPixel('grid', [0, 0])[1] - eChart.convertToPixel('grid', [0, 1])[1]) * HEIGHT_RATIO;

        if (!el) {
          // @ts-ignore
          el = new echarts.graphic.Rect({
            shape: { x: 0, y: 0, width: 0, height: 0 },
            style: style,
            z: z
          });
          eChart.getZr().add(el);
        }
        el.attr({
          shape: { x: 0, y: 0, width: barLength, height: barHeight },
          position: [pointArrival[0], pointArrival[1] - barHeight]
        });
        return el;
      };

      const prepareDrop = () => {
        // Check droppable place.
        const xPixel = draggingEl.shape.x + draggingEl.position[0];
        const yPixel = draggingEl.shape.y + draggingEl.position[1];
        const cursorData = eChart.convertFromPixel('grid', [xPixel, yPixel]);
        if (cursorData) {
          // Make drop shadow and dropRecord
          dropRecord = {
            categoryIndex: Math.floor(cursorData[1]),
            timeArrival: cursorData[0],
            timeDeparture: cursorData[0] + draggingTimeLength
          };
          const style = { fill: 'rgba(0,0,0,0.4)' };
          dropShadow = addOrUpdateBar(dropShadow, dropRecord, style, 99);
        }
      };

      // This is some business logic, don't care about it.
      const updateRawData = (params) => {
        const flightData = chartData.deal.data;
        const movingItem = flightData[draggingRecord.dataIndex];

        const arr = chartData.deal.dimensions.map((dimension: string, index: number) => ({
          dimension,
          value: movingItem[index]
        }));
        console.log(arr);

        // Check conflict
        for (let i = 0; i < flightData.length; i++) {
          const dataItem = flightData[i];
          if (
            (dataItem !== movingItem &&
              dropRecord.categoryIndex === dataItem[CATEGORY_INDEX] &&
              dropRecord.timeArrival < dataItem[END_DATE] &&
              dropRecord.timeDeparture > dataItem[START_DATE]) ||
            params.offsetY < 90 ||
            params.offsetX < 100 ||
            (params.offsetY < 90 && params.offsetX < 100)
          ) {
            alert('Конфликт! Найдите свободное время!');
            return;
          }
        }

        // No conflict.
        movingItem[CATEGORY_INDEX] = dropRecord.categoryIndex;
        movingItem[START_DATE] = dropRecord.timeArrival;
        movingItem[END_DATE] = dropRecord.timeDeparture;

        return true;
      };

      const autoDataZoomWhenDraggingOutside = (cursorX, cursorY) => {
        // When cursor is outside the cartesian and being dragging,
        // auto move the dataZooms.
        const cursorDistX = getCursorCartesianDist(cursorX, cartesianXBounds);
        const cursorDistY = getCursorCartesianDist(cursorY, cartesianYBounds);

        if (cursorDistX !== 0 || cursorDistY !== 0) {
          autoDataZoomAnimator.start({
            cursorDistX: cursorDistX,
            cursorDistY: cursorDistY
          });
        } else {
          autoDataZoomAnimator.stop();
        }
      };

      const getCursorCartesianDist = (cursorXY, bounds) => {
        const dist0 = cursorXY - (bounds[0] + DATA_ZOOM_AUTO_MOVE_DETECT_AREA_WIDTH);
        const dist1 = cursorXY - (bounds[1] - DATA_ZOOM_AUTO_MOVE_DETECT_AREA_WIDTH);
        return dist0 * dist1 <= 0
          ? 0 // cursor is in cartesian
          : dist0 < 0
          ? dist0 // cursor is at left/top of cartesian
          : dist1; // cursor is at right/bottom of cartesian
      };
    },
    [dispatch]
  );

  useEffect(() => {
    const chart = echarts.init(eChart.current);
    chart.setOption({
      tooltip: {},
      animation: false,
      title: {
        text: chartTitle,
        left: 'center'
      },
      // dataZoom: [
      //   {
      //     type: 'slider',
      //     xAxisIndex: 0,
      //     filterMode: 'weakFilter',
      //     height: 20,
      //     bottom: 20,
      //     start: 0,
      //     end: 26,
      //     handleIcon:
      //       'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      //     handleSize: '80%',
      //     showDetail: false
      //   },
      //   {
      //     type: 'inside',
      //     id: 'insideX',
      //     xAxisIndex: 0,
      //     filterMode: 'weakFilter',
      //     start: 0,
      //     end: 26,
      //     zoomOnMouseWheel: false,
      //     moveOnMouseMove: false
      //   },
      //   {
      //     type: 'slider',
      //     yAxisIndex: 0,
      //     zoomLock: true,
      //     width: 20,
      //     right: 20,
      //     top: 70,
      //     bottom: 40,
      //     start: 95,
      //     end: 100,
      //     handleIcon:
      //       'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      //     handleSize: '80%',
      //     showDetail: false
      //   },
      //   {
      //     type: 'inside',
      //     id: 'insideY',
      //     yAxisIndex: 0,
      //     start: 95,
      //     end: 100,
      //     zoomOnMouseWheel: false,
      //     moveOnMouseMove: false,
      //     moveOnMouseWheel: true
      //   }
      // ],
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'weakFilter',
          showDetail: false
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'weakFilter',
          showDetail: false,
          zoomOnMouseWheel: false,
          moveOnMouseMove: false
        },
        {
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'none'
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          filterMode: 'none',
          zoomOnMouseWheel: false,
          moveOnMouseMove: false,
          moveOnMouseWheel: true
        }
      ],
      grid: {
        show: true,
        top: 40,
        bottom: 40,
        left: 200,
        right: 40,
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
        splitLine: { show: false },
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
            tooltip: [CATEGORY_INDEX, START_DATE, END_DATE]
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
    resizeObserver.observe(eChart.current);
    initDrag(chart);
  }, [initDrag, chartTitle]);

  return <div ref={eChart} className='chart' />;
};
