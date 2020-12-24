import { AnyAction, combineReducers } from 'redux';
import { AppEpic } from './store';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { appReducer, variantsEpic } from '../../app/app.slice';

export const rootReducer = combineReducers({
  app: appReducer
});

export type RootState = ReturnType<typeof rootReducer>;

const epics = [variantsEpic];

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
