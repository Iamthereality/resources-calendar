import React, { FC, MouseEvent } from 'react';
import './modal-window.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store/root.reducer';
import { resetSelectedRecord, resetNewRecord } from '../../../modules/gantt-chart-module/gantt-chart.slice';
import { NewRecord } from '../../../modules/gantt-chart-module/components/new-record/new-record';

export const ModalWindow: FC = ({ children }): JSX.Element => {
  const dispatch = useDispatch();
  const { selectedRecord, newRecord } = useSelector((state: RootState) => state.ganttChart);

  const closeWindow = (): void => {
    dispatch(resetSelectedRecord());
    dispatch(resetNewRecord());
  };

  return Object.keys(selectedRecord).length > 0 || newRecord ? (
    <div className='modal-window'>
      <div className='modal-window__overlay' onClick={closeWindow}>
        <div
          className='modal-window__container'
          onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
        >
          <div className='data-container'>
            <div className='modal-window__close' onClick={closeWindow} />

            {newRecord ? (
              <NewRecord />
            ) : (
              Object.keys(selectedRecord).map((key: any) => <p key={key}>{`${key}: ${selectedRecord[key]}`}</p>)
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
