import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DealInterface, ProvidedService } from '../../core/models/auto-service.interface';
import { AppEpic } from '../../core/store/store';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { RootState } from '../../core/store/root.reducer';
import { concatMap, filter, switchMap, withLatestFrom } from 'rxjs/operators';
import { addDeal, updateDeal } from '../../core/api/api.service';

interface GanttChartSliceInterface {
  reloadChartData: boolean;
  onSaveLoading: boolean;
  chartIsLoading: boolean;
  deal: DealInterface;
  newDeal: DealInterface;
  sideBarState: boolean;
}

const initialState: GanttChartSliceInterface = {
  reloadChartData: false,
  onSaveLoading: false,
  chartIsLoading: true,
  deal: {} as DealInterface,
  newDeal: {} as DealInterface,
  sideBarState: false
};

export const ganttChartSlice = createSlice({
  name: 'ganttChartSlice',
  initialState,
  reducers: {
    setChartIsLoading(state, action: PayloadAction<boolean>) {
      state.chartIsLoading = action.payload;
    },
    openDeal(state, action: PayloadAction<DealInterface | null>) {
      state.deal = action.payload;
      if (action.payload) {
        state.newDeal = action.payload;
      }
      state.sideBarState = true;
    },
    closeDeal(state) {
      state.deal = initialState.deal;
      state.newDeal = initialState.newDeal;
      state.sideBarState = initialState.sideBarState;
      state.onSaveLoading = initialState.onSaveLoading;
    },
    addNewDeal(state) {
      state.onSaveLoading = true;
    },
    updateSelectedDeal(state) {
      state.onSaveLoading = true;
    },
    setNewDeal(state, action: PayloadAction<{ fieldName: string; value: any }>) {
      state.newDeal[action.payload.fieldName] = action.payload.value;
    },
    setChartDataReloading(state, action: PayloadAction<boolean>) {
      state.reloadChartData = action.payload;
    }
  }
});

export const {
  openDeal,
  closeDeal,
  setChartIsLoading,
  addNewDeal,
  updateSelectedDeal,
  setNewDeal,
  setChartDataReloading
} = ganttChartSlice.actions;

export const ganttChartReducer = ganttChartSlice.reducer;

export const AddDealEpic: AppEpic = (action$: ActionsObservable<AnyAction>, state$: StateObservable<RootState>) => {
  return action$.pipe(
    filter(addNewDeal.match),
    withLatestFrom(state$),
    switchMap(
      ([
        ,
        {
          ganttChart: { newDeal },
          autoService: { selectedAutoService, providedServices }
        }
      ]) => {
        const payload = JSON.stringify({
          serviceId: selectedAutoService.address,
          leadId: newDeal.leadId,
          acceptorId: newDeal.acceptorId,
          mechanicId: newDeal.mechanicId,
          providedServiceId: providedServices.filter(
            (service: ProvidedService) => service.id === newDeal.providedServiceId.toString()
          )[0].name,
          accept: newDeal.accept,
          start: newDeal.start,
          end: newDeal.end,
          release: newDeal.release
        });
        return addDeal(payload).pipe(concatMap(() => [closeDeal(), setChartDataReloading(true)]));
      }
    )
  );
};

export const UpdateDealEpic: AppEpic = (action$: ActionsObservable<AnyAction>, state$: StateObservable<RootState>) => {
  return action$.pipe(
    filter(updateSelectedDeal.match),
    withLatestFrom(state$),
    switchMap(
      ([
        ,
        {
          ganttChart: { newDeal },
          autoService: { selectedAutoService }
        }
      ]) => {
        const payload = JSON.stringify({
          serviceId: selectedAutoService.id,
          dealId: +newDeal.id,
          acceptorId: newDeal.acceptorId,
          mechanicId: newDeal.mechanicId,
          providedServiceId: newDeal.providedServiceId,
          accept: newDeal.accept,
          start: newDeal.start,
          end: newDeal.end,
          release: newDeal.release
        });
        return updateDeal(payload).pipe(concatMap(() => [closeDeal(), setChartDataReloading(true)]));
      }
    )
  );
};
