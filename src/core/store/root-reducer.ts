import { AnyAction, combineReducers } from 'redux';
import { AppEpic } from './store';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const rootReducer = combineReducers({});

export type RootState = ReturnType<typeof rootReducer>;

const epics = [];

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
