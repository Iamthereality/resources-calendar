import React, { FC, MouseEvent } from 'react';
import './modal-window.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store/root.reducer';
import { resetSelectedRecord } from '../../../modules/gantt-chart-module/gantt-chart.slice';

export const ModalWindow: FC = ({ children }): JSX.Element => {
  const dispatch = useDispatch();
  const { selectedRecord } = useSelector((state: RootState) => state.ganttChart);

  const closeWindow = (): void => {
    dispatch(resetSelectedRecord());
  };

  return selectedRecord.length > 0 ? (
    <div className='modal-window'>
      <div className='modal-window__overlay' onClick={closeWindow}>
        <div
          className='modal-window__container'
          onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
        >
          <div className='data-container'>
            <div className='modal-window__close' onClick={closeWindow} />
            {children}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
