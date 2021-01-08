import React, { FC, useEffect, useRef, useState } from 'react';
import './auto-service-selection.scss';
import { RootState } from '../../../../core/store/root.reducer';
import { useDispatch, useSelector } from 'react-redux';
import { AutoServiceInterface } from '../../../../core/models/auto-service.interface';
import { setAutoServices, setSelectedAutoService } from '../../auto-service.slice';
import { SubscriptionLike } from 'rxjs';
import { getAutoServices, getRawData } from '../../../../core/api/api.service';

export const AutoServiceSelection: FC = () => {
  const dispatch = useDispatch();
  const { autoServices } = useSelector((state: RootState) => state.office);

  const [loading, setLoading] = useState<boolean>(autoServices.length < 1);
  const [services, setServices] = useState<AutoServiceInterface[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);

  const rawDataSub = useRef<SubscriptionLike>(null);
  const autoServicesSub = useRef<SubscriptionLike>(null);

  useEffect(() => {
    if (loading && rawData.length < 1 && autoServices.length < 1) {
      rawDataSub.current = getRawData().subscribe((resp: any) => setRawData(resp.result));
      return () => rawDataSub.current.unsubscribe;
    }
  }, [loading, rawData, autoServices]);

  useEffect(() => {
    if (loading && rawData.length > 0) {
      let requestIndex = 0;
      rawData.forEach((res: any) => {
        autoServicesSub.current = getAutoServices(res.ID).subscribe((response: any) => {
          if (response.result.EDIT_FORM_LABEL.ru.includes('Сервис на:')) {
            setServices((state: AutoServiceInterface[]) => {
              return [
                ...state,
                {
                  id: response.result.ID,
                  address: response.result.EDIT_FORM_LABEL.ru
                }
              ];
            });
          }
          if (requestIndex === rawData.length - 1) {
            setLoading(false);
          }
          requestIndex++;
        });
        return () => autoServicesSub.current.unsubscribe();
      });
    }
  }, [loading, rawData]);

  useEffect(() => {
    if (!loading && services.length > 0) {
      dispatch(setAutoServices(services));
    }
  }, [dispatch, loading, services]);

  const setAutoService = (autoService: AutoServiceInterface): void => {
    console.log(autoService);
    dispatch(setSelectedAutoService(autoService));
  };

  return loading ? (
    <h2>Loading</h2>
  ) : (
    <div className='office-selection__container'>
      <h2 className='office-selection__header'>{autoServices.length > 0 ? 'Выберите офис' : 'Нет доступных офисов'}</h2>
      <ul className='office-selection__offices'>
        {autoServices.map((autoService: AutoServiceInterface) => (
          <li key={autoService.id} className='office-selection__office' onClick={() => setAutoService(autoService)}>
            <span>{autoService.address}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
