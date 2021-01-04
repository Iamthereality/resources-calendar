import React, { FC } from 'react';
import './gantt-chart.scss';
import { Chart } from '../../../../shared/components/chart/chart';

const options = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'bar',
      smooth: true
    }
  ]
};

export const GantChart: FC = () => {
  return <Chart options={options} />;
};
