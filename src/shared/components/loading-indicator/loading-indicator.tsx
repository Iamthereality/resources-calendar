import React, { FC } from 'react';
import './loading-indicator.scss';

export const LoadingIndicator: FC = () => {
  return (
    <div className='loading-indicator__container'>
      <div className='loading-indicator__dual-ball'>
        <div className='loading-indicator__animation'>
          <div />
          <div />
          <div />
        </div>
      </div>
    </div>
  );
};
