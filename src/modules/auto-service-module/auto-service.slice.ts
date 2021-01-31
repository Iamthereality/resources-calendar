import { AutoServiceInterface } from '../../core/models/auto-service.interface';
import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppEpic } from '../../core/store/store';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { RootState } from '../../core/store/root.reducer';
import { concatMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { getAutoServiceResources, getAutoServices } from '../../core/api/api.service';
import { GetAutoServicesResponse } from '../../core/models/api.interface';

interface AutoServiceSliceInterface {
  loading: boolean;
  autoServices: AutoServiceInterface[];
  selectedAutoService: AutoServiceInterface;
  acceptors: any[];
  mechanics: any[];
}

const initialState: AutoServiceSliceInterface = {
  loading: true,
  selectedAutoService: {} as AutoServiceInterface,
  autoServices: [],
  acceptors: [],
  mechanics: []
};

export const autoServiceSlice = createSlice({
  name: 'autoServiceSlice',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    getServices() {},
    setAutoServices(state, action: PayloadAction<AutoServiceInterface[]>) {
      state.autoServices = action.payload;
      state.loading = false;
    },
    setSelectedAutoService(state, action: PayloadAction<AutoServiceInterface>) {
      state.selectedAutoService = action.payload;
    },
    resetSelectedAutoService(state) {
      state.selectedAutoService = initialState.selectedAutoService;
    },
    getServiceResources(state) {
      state.loading = true;
    },
    setAcceptors(state, action: PayloadAction<any[]>) {
      state.acceptors = action.payload;
    },
    setMechanics(state, action: PayloadAction<any[]>) {
      state.mechanics = action.payload;
    }
  }
});

export const {
  setLoading,
  getServices,
  setAutoServices,
  setSelectedAutoService,
  resetSelectedAutoService,
  getServiceResources,
  setAcceptors,
  setMechanics
} = autoServiceSlice.actions;

export const autoServiceReducer = autoServiceSlice.reducer;

export const AutoServicesEpic: AppEpic = (
  action$: ActionsObservable<AnyAction>,
  state$: StateObservable<RootState>
) => {
  return action$.pipe(
    filter(getServices.match),
    withLatestFrom(state$),
    switchMap(([, { ganttChart, autoService }]) =>
      getAutoServices().pipe(
        map((resp: GetAutoServicesResponse) => ({ autoServices: resp.data })),
        concatMap((resp: { autoServices: AutoServiceInterface[] }) => [setAutoServices(resp.autoServices)])
      )
    )
  );
};

export const AutoServiceResourcesEpic: AppEpic = (
  action$: ActionsObservable<AnyAction>,
  state$: StateObservable<RootState>
) => {
  return action$.pipe(
    filter(getServiceResources.match),
    withLatestFrom(state$),
    switchMap(([, { ganttChart, autoService: { selectedAutoService } }]) =>
      getAutoServiceResources(selectedAutoService.id).pipe(
        map((resp: any) => {
          console.log(resp);
          return resp.data;
        }),
        concatMap((resp: { acceptors: any[]; mechanics: any[] }) => [
          setAcceptors(resp.acceptors),
          setMechanics(resp.mechanics),
          setLoading(false)
        ])
        // map((resp: GetAutoServicesResponse) => ({ autoServices: resp.data })),
        // concatMap((resp: { autoServices: AutoServiceInterface[] }) => [setAutoServices(resp.autoServices)])
      )
    )
  );
};
