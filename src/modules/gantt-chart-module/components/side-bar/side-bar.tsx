import { MouseEvent, FC } from 'react';
import './side-bar.scss';
import { useDispatch, useSelector } from 'react-redux';
import { closeDeal, updateSelectedDeal, addNewDeal } from '../../gantt-chart.slice';
import { RootState } from '../../../../core/store/root.reducer';
import { AppSelectField } from '../../../../shared/components/form-fields/select-field/app-select-field';
import { DealInterface, EmployeeInterface, ProvidedService } from '../../../../core/models/auto-service.interface';
import { AppDatetimeField } from '../../../../shared/components/form-fields/datetime-field/app-datetime-field';
import { AppTextField } from '../../../../shared/components/form-fields/text-field/app-text-field';

export const SideBar: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const { deal } = useSelector((state: RootState) => state.ganttChart);
  const { providedServices, acceptors, mechanics, deals } = useSelector((state: RootState) => state.autoService);

  const closeSidebar = (): void => {
    dispatch(closeDeal());
  };

  const makeOptionsOf = (employees: EmployeeInterface[]): { id: string; name: string }[] => {
    return employees.map((employee: EmployeeInterface) => ({
      id: employee.id,
      name: `${employee.name} ${employee.lastName}`
    }));
  };

  const saveDeal = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    dispatch(deal ? updateSelectedDeal() : addNewDeal());
  };

  return (
    <div className='sidebar'>
      <div className='sidebar__header'>
        <div className='sidebar__header__info'>
          <div className='sidebar__header__info-title'>{deal ? deal.title : 'Новая запись'}</div>
          <div onClick={closeSidebar} className='sidebar__header__info-close'>
            X
          </div>
        </div>
        {deal ? (
          <a
            className='sidebar__header-deal-link'
            href={`https://bazis-motors.bitrix24.ru/crm/deal/details/${deal.id}/`}
            target='_blank'
            rel='noreferrer'
          >
            Открыть сделку
          </a>
        ) : null}
      </div>
      <div className='sidebar__body'>
        <form className='sidebar__body-form'>
          {!deal ? <AppTextField controlName={'leadId'} label={'ID лида'} /> : null}
          <AppSelectField
            controlName={'providedServiceId'}
            label={'Услуга'}
            options={providedServices}
            defaultValue={
              deal
                ? providedServices.filter(
                    (service: ProvidedService) => service.id === deal.providedServiceId.toString()
                  )[0].id
                : ''
            }
          />
          <AppSelectField
            controlName={'acceptorId'}
            label={'Приёмщик'}
            options={makeOptionsOf(acceptors)}
            defaultValue={
              deal
                ? acceptors.filter((acceptor: EmployeeInterface) => acceptor.id === deal.acceptorId.toString())[0].id
                : ''
            }
          />
          <AppSelectField
            controlName={'mechanicId'}
            label={'Механик'}
            options={makeOptionsOf(mechanics)}
            defaultValue={
              deal
                ? mechanics.filter((mechanic: EmployeeInterface) => mechanic.id === deal.mechanicId.toString())[0].id
                : ''
            }
          />
          <AppDatetimeField
            controlName={'accept'}
            label={'Приём автомобиля'}
            defaultValue={
              deal ? deals.filter((savedDeal: DealInterface) => savedDeal.id === deal.id)[0].accept.slice(0, 16) : ''
            }
          />
          <AppDatetimeField
            controlName={'start'}
            label={'Начало обслуживания'}
            defaultValue={
              deal ? deals.filter((savedDeal: DealInterface) => savedDeal.id === deal.id)[0].start.slice(0, 16) : ''
            }
          />
          <AppDatetimeField
            controlName={'end'}
            label={'Конец обслуживания'}
            defaultValue={
              deal ? deals.filter((savedDeal: DealInterface) => savedDeal.id === deal.id)[0].end.slice(0, 16) : ''
            }
          />
          <AppDatetimeField
            controlName={'release'}
            label={'Выдача автомобиля'}
            defaultValue={
              deal ? deals.filter((savedDeal: DealInterface) => savedDeal.id === deal.id)[0].release.slice(0, 16) : ''
            }
          />
          <button className='save' onClick={saveDeal}>
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
};
