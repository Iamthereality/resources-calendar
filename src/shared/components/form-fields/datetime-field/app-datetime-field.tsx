import { ChangeEvent, FC, useEffect, useState } from 'react';
import './app-datetime-field.scss';
import { FormControl, TextField } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { setNewDeal } from '../../../../modules/gantt-chart-module/gantt-chart.slice';

interface Props {
  controlName: string;
  label: string;
  defaultValue: string;
  error?: boolean;
}

export const AppDatetimeField: FC<Props> = ({ controlName, label, defaultValue, error }): JSX.Element => {
  const dispatch = useDispatch();
  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

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
    <FormControl className='datetime-field'>
      <TextField
        id={controlName}
        label={label}
        type='datetime-local'
        error={error}
        value={value}
        onChange={onValueChange}
        variant='outlined'
        InputLabelProps={{
          shrink: true
        }}
      />
    </FormControl>
  );
};
