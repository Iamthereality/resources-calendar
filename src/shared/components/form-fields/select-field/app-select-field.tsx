import { ChangeEvent, FC, useEffect, useState } from 'react';
import './app-select-field.scss';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { setNewDeal } from '../../../../modules/gantt-chart-module/gantt-chart.slice';

interface Option {
  id: string;
  name: string;
}

interface Props {
  controlName: string;
  label: string;
  options: Option[];
  defaultValue: string;
  error?: boolean;
}

export const AppSelectField: FC<Props> = ({ controlName, label, options, defaultValue, error }): JSX.Element => {
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

  const onValueChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setValue(event.target.value);
  };

  return (
    <>
      <FormControl variant={'outlined'} className='select-field'>
        <InputLabel htmlFor={controlName}>{label}</InputLabel>
        <Select
          label={label}
          value={value}
          onChange={onValueChange}
          error={error}
          inputProps={{
            name: `${controlName}`,
            id: `${controlName}`
          }}
        >
          {options.map((option: Option) => (
            <MenuItem key={`${option.name}${option.id}`} value={option.id}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
