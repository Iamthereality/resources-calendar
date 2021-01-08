import { AnyAction, combineReducers } from 'redux';
import { AppEpic } from './store';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { appReducer } from '../../modules/app-module/app.slice';
import { autoServiceReducer } from '../../modules/auto-service-module/auto-service.slice';
import { ganttChartReducer } from '../../modules/gantt-chart-module/gantt-chart.slice';

export const rootReducer = combineReducers({
  app: appReducer,
  ganttChart: ganttChartReducer,
  office: autoServiceReducer
});

export type RootState = ReturnType<typeof rootReducer>;

const epics = [
  // AutoServicesEpic
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
