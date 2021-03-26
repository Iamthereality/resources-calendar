import { MouseEvent, FC, useState, useEffect } from 'react';
import './side-bar.scss';
import { useDispatch, useSelector } from 'react-redux';
import { closeDeal, updateSelectedDeal, addNewDeal } from '../../gantt-chart.slice';
import { updateAutoServiceDeals } from '../../../auto-service-module/auto-service.slice';
import { RootState } from '../../../../core/store/root.reducer';
import { AppSelectField } from '../../../../shared/components/form-fields/select-field/app-select-field';
import { DealInterface, EmployeeInterface, ProvidedService } from '../../../../core/models/auto-service.interface';
import { AppTextField } from '../../../../shared/components/form-fields/text-field/app-text-field';
import { FormGroup } from '../form-group/form-group';
import { Record } from '../../../../core/models/gantt-chart.inteface';

export const SideBar: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const { deal } = useSelector((state: RootState) => state.ganttChart);
  const { providedServices, acceptors, mechanics, deals } = useSelector((state: RootState) => state.autoService);

  const [acceptor, setAcceptor] = useState<Record>({} as Record);

  useEffect(() => {
    console.log(acceptor);
    if (acceptor.acceptorId) {
      if (acceptor.acceptorId.length > 0) {
        console.log(deals[0]);
        // const halfOfAnHour = 1000 * 60 * 30;
        // const now = new Date().getTime();
        // const accept = now - halfOfAnHour;
        // const release = now + halfOfAnHour;
        // dispatch(updateAutoServiceDeals({
        //   accept: accept.toString(),
        //   release: release.toString()
        // } as DealInterface));
      }
    }
  }, [acceptor]);

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
            {'X'}
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
            controlName={'acceptorId'}
            label={'Приёмщик'}
            options={makeOptionsOf(acceptors)}
            defaultValue={
              deal
                ? acceptors.filter((acceptor: EmployeeInterface) => acceptor.id === deal.acceptorId.toString())[0].id
                : ''
            }
            callback={setAcceptor}
          />
          <FormGroup
            disabled={!acceptor.acceptorId}
            providedServices={providedServices}
            deal={deal}
            mechanics={mechanics}
            options={makeOptionsOf(mechanics)}
          />
          <button className='save' onClick={saveDeal}>
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
};
