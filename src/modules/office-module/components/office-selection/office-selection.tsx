import React, { FC, useEffect } from 'react';
import './office-selection.scss';
import { RootState } from '../../../../core/store/root.reducer';
import { useDispatch, useSelector } from 'react-redux';
import { OfficeInterface } from '../../../../core/models/office.interface';
import { setOffices, setSelectedOffice } from '../../office.slice';

const data: OfficeInterface[] = [
  { id: '1', address: 'test 1', phoneNumber: 111111111 },
  { id: '2', address: 'test 2', phoneNumber: 222222222 }
];

export const OfficeSelection: FC = () => {
  const dispatch = useDispatch();
  const { offices } = useSelector((state: RootState) => state.office);

  useEffect(() => {
    if (offices.length < 1) {
      dispatch(setOffices(data));
    }
  }, [dispatch, offices]);

  const setOffice = (office: OfficeInterface): void => {
    console.log(office);
    dispatch(setSelectedOffice(office));
  };

  return (
    <div className='office-selection__container'>
      <h2 className='office-selection__header'>{offices.length > 0 ? 'Выберите офис' : 'Нет доступных офисов'}</h2>
      <ul className='office-selection__offices'>
        {offices.map((office: OfficeInterface) => (
          <li key={office.id} className='office-selection__office' onClick={() => setOffice(office)}>
            <span>{office.address}</span>
            <span>{office.phoneNumber}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
