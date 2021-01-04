import React, { FC, useEffect, useRef } from 'react';
import './chart.scss';
import * as Echarts from 'echarts';

export declare class ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

// @ts-ignore
const resizeObserver = new ResizeObserver((entries) => {
  entries.map(({ target }) => {
    const instance = Echarts.getInstanceByDom(target);
    return instance.resize();
  });
});

interface Props {
  options: any;
}

export const Chart: FC<Props> = ({ options }) => {
  const eChart = useRef(null);

  useEffect(() => {
    const chart = Echarts.init(eChart.current);
    chart.setOption(options);
    resizeObserver.observe(eChart.current);
  }, [options]);

  return <div ref={eChart} className='chart' />;
};
