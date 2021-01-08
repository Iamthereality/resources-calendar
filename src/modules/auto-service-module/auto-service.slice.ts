import { AutoServiceInterface } from '../../core/models/auto-service.interface';
import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppEpic } from '../../core/store/store';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { RootState } from '../../core/store/root.reducer';
import { filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { getRawData } from '../../core/api/api.service';
import { GetAutoServicesResponse } from '../../core/models/api.interface';

interface AutoServiceSliceInterface {
  autoServices: AutoServiceInterface[];
  selectedAutoService: AutoServiceInterface;
}

const initialState: AutoServiceSliceInterface = {
  selectedAutoService: {} as AutoServiceInterface,
  autoServices: []
};

export const autoServiceSlice = createSlice({
  name: 'autoServiceSlice',
  initialState,
  reducers: {
    getAutoServices() {},
    setAutoServices(state, action: PayloadAction<AutoServiceInterface[]>) {
      state.autoServices = action.payload;
    },
    setSelectedAutoService(state, action: PayloadAction<AutoServiceInterface>) {
      state.selectedAutoService = action.payload;
    },
    resetSelectedAutoService(state) {
      state.selectedAutoService = initialState.selectedAutoService;
    }
  }
});

export const {
  getAutoServices,
  setAutoServices,
  setSelectedAutoService,
  resetSelectedAutoService
} = autoServiceSlice.actions;

export const autoServiceReducer = autoServiceSlice.reducer;

export const AutoServicesEpic: AppEpic = (
  action$: ActionsObservable<AnyAction>,
  state$: StateObservable<RootState>
) => {
  return action$.pipe(
    filter(getAutoServices.match),
    withLatestFrom(state$),
    switchMap(([, { app }]) =>
      getRawData().pipe(
        map((resp: GetAutoServicesResponse) => ({
          offices: resp.data
        })),
        mergeMap((data: { offices: AutoServiceInterface[] }) => [setAutoServices()])
      )
    )
  );
};
