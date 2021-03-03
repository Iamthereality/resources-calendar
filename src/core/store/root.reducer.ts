import { AnyAction, combineReducers } from 'redux';
import { AppEpic } from './store';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  autoServiceReducer,
  AutoServiceResourcesEpic,
  AutoServiceDealsEpic,
  AutoServiceProvidedServicesEpic,
  AutoServicesEpic
} from '../../modules/auto-service-module/auto-service.slice';
import { AddDealEpic, ganttChartReducer, UpdateDealEpic } from '../../modules/gantt-chart-module/gantt-chart.slice';

export const rootReducer = combineReducers({
  ganttChart: ganttChartReducer,
  autoService: autoServiceReducer
});

export type RootState = ReturnType<typeof rootReducer>;

const epics = [
  AutoServicesEpic,
  AutoServiceResourcesEpic,
  AutoServiceDealsEpic,
  AutoServiceProvidedServicesEpic,
  AddDealEpic,
  UpdateDealEpic
];

export const rootEpic: AppEpic = (
  action$: ActionsObservable<AnyAction>,
  store$: StateObservable<RootState>,
  dependencies
) =>
  combineEpics(...epics)(action$, store$, dependencies).pipe(
    catchError((error, source: Observable<AnyAction>) => {
      console.error(error);
      return source;
    })
  );
