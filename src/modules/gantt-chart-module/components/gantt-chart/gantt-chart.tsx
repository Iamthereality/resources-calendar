import React, { FC, useEffect, useRef } from 'react';
import './gantt-chart.scss';
import { Chart } from '../../../../shared/components/chart/chart';
import { SubscriptionLike } from 'rxjs';
import { getBitrixOffices } from '../../../../core/api/api.service';

export const GantChart: FC = () => {
  const request = useRef<SubscriptionLike>(null);
  useEffect(() => {
    request.current = getBitrixOffices().subscribe((resp: any) => console.log(resp));
    return request.current.unsubscribe;
  }, []);

  return <Chart />;
};
