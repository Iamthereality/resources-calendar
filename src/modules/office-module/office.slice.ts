import { OfficeInterface } from '../../core/models/office.interface';
import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppEpic } from '../../core/store/store';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { RootState } from '../../core/store/root.reducer';
import { filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { getBitrixOffices } from '../../core/api/api.service';
import { GetOfficesResponse } from '../../core/models/api.interface';

interface OfficeSliceInterface {
  offices: OfficeInterface[];
  selectedOffice: OfficeInterface;
}

const initialState: OfficeSliceInterface = {
  selectedOffice: {} as OfficeInterface,
  offices: []
};

export const officeSlice = createSlice({
  name: 'appSlice',
  initialState,
  reducers: {
    getOffices() {},
    setOffices(state, action: PayloadAction<OfficeInterface[]>) {
      state.offices = action.payload;
    },
    setSelectedOffice(state, action: PayloadAction<OfficeInterface>) {
      state.selectedOffice = action.payload;
    }
  }
});

export const { getOffices, setOffices, setSelectedOffice } = officeSlice.actions;

export const officeReducer = officeSlice.reducer;

export const officesEpic: AppEpic = (action$: ActionsObservable<AnyAction>, state$: StateObservable<RootState>) => {
  return action$.pipe(
    filter(getOffices.match),
    withLatestFrom(state$),
    switchMap(([, { app }]) =>
      getBitrixOffices().pipe(
        map((resp: GetOfficesResponse) => ({
          offices: resp.data
        })),
        mergeMap((data: { offices: OfficeInterface[] }) => [setOffices()])
      )
    )
  );
};
