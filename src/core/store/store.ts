import { AnyAction, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createEpicMiddleware, Epic } from 'redux-observable';
import { rootEpic, rootReducer, RootState } from './root-reducer';

const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>();

export const store = configureStore({
  reducer: rootReducer,
  middleware: [
    ...getDefaultMiddleware({
      thunk: false
    }),
    epicMiddleware
  ]
});

epicMiddleware.run(rootEpic);

export type AppDispatch = typeof store.dispatch;
export type AppEpic = Epic<AnyAction, AnyAction, RootState>;
