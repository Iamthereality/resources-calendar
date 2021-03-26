import './form-group.scss';
import { FC, useEffect, useState } from 'react';
import { DealInterface, EmployeeInterface, ProvidedService } from '../../../../core/models/auto-service.interface';
import { AppSelectField } from '../../../../shared/components/form-fields/select-field/app-select-field';
import { Record } from '../../../../core/models/gantt-chart.inteface';

interface Option {
  id: string;
  name: string;
}

interface Props {
  providedServices: ProvidedService[];
  deal: DealInterface;
  mechanics: EmployeeInterface[];
  options: Option[];
  disabled: boolean;
}

export const FormGroup: FC<Props> = ({ providedServices, deal, mechanics, options, disabled }): JSX.Element => {
  const [record, setRecord] = useState<Record>({} as Record);

  useEffect(() => {
    console.log(record);
  }, [record]);

  return (
    <>
      <AppSelectField
        disabled={disabled}
        controlName={'providedServiceId'}
        label={'Услуга'}
        options={providedServices}
        defaultValue={
          deal
            ? providedServices.filter((service: ProvidedService) => service.id === deal.providedServiceId.toString())[0]
                .id
            : ''
        }
        callback={setRecord}
      />
      <AppSelectField
        disabled={!record.providedServiceId}
        controlName={'mechanicId'}
        label={'Механик'}
        options={options}
        defaultValue={
          deal
            ? mechanics.filter((mechanic: EmployeeInterface) => mechanic.id === deal.mechanicId.toString())[0].id
            : ''
        }
        callback={setRecord}
      />
    </>
  );
};
