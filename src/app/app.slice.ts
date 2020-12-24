import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OfficeInterface } from '../core/models/office.interface';
import { AppEpic } from '../core/store/store';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { RootState } from '../core/store/root.reducer';
import { filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { getBitrixOffices } from '../core/api/api.service';
import { GetOfficesResponse } from '../core/models/api.interface';

interface AppSliceInterface {
  loading: boolean;
  offices: OfficeInterface[];
}

const initialState: AppSliceInterface = {
  loading: true,
  offices: []
};

export const appSlice = createSlice({
  name: 'appSlice',
  initialState,
  reducers: {
    getOffices(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setOffices(state, action: PayloadAction<OfficeInterface[]>) {
      state.offices = action.payload;
    }
  }
});

export const { getOffices, setOffices } = appSlice.actions;

export const appReducer = appSlice.reducer;

export const variantsEpic: AppEpic = (action$: ActionsObservable<AnyAction>, state$: StateObservable<RootState>) => {
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
