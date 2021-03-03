import { FC, useEffect } from 'react';
import './auto-service-selection.scss';
import { RootState } from '../../../../core/store/root.reducer';
import { useDispatch, useSelector } from 'react-redux';
import { AutoServiceInterface } from '../../../../core/models/auto-service.interface';
import { getServices, setSelectedAutoService } from '../../auto-service.slice';
import { LoadingIndicator } from '../../../../shared/components/loading-indicator/loading-indicator';

export const AutoServiceSelection: FC = () => {
  const dispatch = useDispatch();
  const { autoServices, loading } = useSelector((state: RootState) => state.autoService);

  useEffect(() => {
    if (loading) {
      dispatch(getServices());
    }
  }, [dispatch, loading]);

  const setAutoService = (autoService: AutoServiceInterface): void => {
    dispatch(setSelectedAutoService(autoService));
  };

  return (
    <div className='office-selection__container'>
      <h2 className='office-selection__header'>{!loading ? 'Выберите автосервис' : 'Получение данных'}</h2>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <ul className='office-selection__offices'>
          {autoServices.map((autoService: AutoServiceInterface) => (
            <li
              key={autoService.address}
              className='office-selection__office'
              onClick={() => setAutoService(autoService)}
            >
              <span>{autoService.address}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
