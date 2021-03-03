import { ChangeEvent, FC, useEffect, useState } from 'react';
import './app-text-field.scss';
import { FormControl, InputLabel, OutlinedInput } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { setNewDeal } from '../../../../modules/gantt-chart-module/gantt-chart.slice';

interface Props {
  controlName: string;
  label: string;
  error?: boolean;
}

export const AppTextField: FC<Props> = ({ controlName, label, error }): JSX.Element => {
  const dispatch = useDispatch();
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    dispatch(
      setNewDeal({
        fieldName: controlName,
        value: value
      })
    );
  }, [dispatch, value, controlName]);

  const onValueChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
  };

  return (
    <FormControl variant={'outlined'} className='text-field'>
      <InputLabel htmlFor={controlName}>{label}</InputLabel>
      <OutlinedInput label={label} value={value} onChange={onValueChange} error={error} id={controlName} />
    </FormControl>
  );
};
