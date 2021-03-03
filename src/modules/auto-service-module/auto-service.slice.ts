import {
  AutoServiceInterface,
  DealInterface,
  EmployeeInterface,
  ProvidedService,
  ResourcesInterface
} from '../../core/models/auto-service.interface';
import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppEpic } from '../../core/store/store';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { RootState } from '../../core/store/root.reducer';
import { concatMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { getAutoServiceResources, getAutoServices, getDeals, getProvidedServices } from '../../core/api/api.service';
import {
  AutoServicesResponse,
  DealsResponse,
  ProvidedServicesResponse,
  ResourcesResponse
} from '../../core/models/api.interface';
import { setChartIsLoading, setChartDataReloading } from '../gantt-chart-module/gantt-chart.slice';

interface AutoServiceSliceInterface {
  loading: boolean;
  autoServices: AutoServiceInterface[];
  selectedAutoService: AutoServiceInterface;
  acceptors: EmployeeInterface[];
  mechanics: EmployeeInterface[];
  providedServices: ProvidedService[];
  deals: DealInterface[];
}

const initialState: AutoServiceSliceInterface = {
  loading: true,
  selectedAutoService: {} as AutoServiceInterface,
  autoServices: [],
  acceptors: [],
  mechanics: [],
  providedServices: [],
  deals: []
};

export const autoServiceSlice = createSlice({
  name: 'autoServiceSlice',
  initialState,
  reducers: {
    getServices() {},
    setAutoServices(state, action: PayloadAction<AutoServiceInterface[]>) {
      state.autoServices = action.payload;
      state.loading = false;
    },
    setSelectedAutoService(state, action: PayloadAction<AutoServiceInterface>) {
      state.selectedAutoService = action.payload;
      setLoading(false);
    },
    resetSelectedAutoService(state) {
      state.selectedAutoService = initialState.selectedAutoService;
    },
    getServiceResources(state) {
      state.loading = true;
    },
    setAcceptors(state, action: PayloadAction<EmployeeInterface[]>) {
      state.acceptors = action.payload;
    },
    setMechanics(state, action: PayloadAction<EmployeeInterface[]>) {
      state.mechanics = action.payload;
    },
    getAutoServiceDeals(state) {
      state.loading = true;
    },
    setAutoServiceDeals(state, action: PayloadAction<DealInterface[]>) {
      state.deals = action.payload;
      state.loading = false;
    },
    getAutoServiceProvidedServices(state) {
      state.loading = true;
    },
    setAutoServiceProvidedServices(state, action: PayloadAction<ProvidedService[]>) {
      state.providedServices = action.payload;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
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
  setMechanics,
  getAutoServiceProvidedServices,
  setAutoServiceProvidedServices,
  getAutoServiceDeals,
  setAutoServiceDeals
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
        map((resp: AutoServicesResponse) => ({ autoServices: resp.data })),
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
    switchMap(([, { autoService: { selectedAutoService } }]) =>
      getAutoServiceResources(selectedAutoService.id).pipe(
        map((resp: ResourcesResponse) => resp.data),
        concatMap((data: ResourcesInterface) => [
          setAcceptors(data.acceptors),
          setMechanics(data.mechanics),
          getAutoServiceDeals()
        ])
      )
    )
  );
};

export const AutoServiceDealsEpic: AppEpic = (
  action$: ActionsObservable<AnyAction>,
  state$: StateObservable<RootState>
) => {
  return action$.pipe(
    filter(getAutoServiceDeals.match),
    withLatestFrom(state$),
    switchMap(([, { autoService: { selectedAutoService } }]) =>
      getDeals(selectedAutoService.id).pipe(
        map((resp: DealsResponse) => resp.data),
        concatMap((data: DealInterface[]) => [setAutoServiceDeals(data), getAutoServiceProvidedServices()])
      )
    )
  );
};

export const AutoServiceProvidedServicesEpic: AppEpic = (
  action$: ActionsObservable<AnyAction>,
  state$: StateObservable<RootState>
) => {
  return action$.pipe(
    filter(getAutoServiceProvidedServices.match),
    withLatestFrom(state$),
    switchMap(([, { autoService: { selectedAutoService } }]) =>
      getProvidedServices(selectedAutoService.id).pipe(
        map((resp: ProvidedServicesResponse) => resp.data),
        concatMap((data: ProvidedService[]) => [
          setAutoServiceProvidedServices(data),
          setChartIsLoading(false),
          setChartDataReloading(false)
        ])
      )
    )
  );
};
