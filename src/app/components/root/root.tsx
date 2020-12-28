import React, { FC } from 'react';
import './root.scss';
import { GantChart } from '../gantt-chart/gantt-chart';
import { OfficeSelection } from '../office-selection/office-selection';

export const Root: FC = (): JSX.Element => {
  return (
    <>
      <OfficeSelection />
      <GantChart />
    </>
  );
};
