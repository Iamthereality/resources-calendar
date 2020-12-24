import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { ResourcesCalendar } from './components/resources-calendar/resources-calendar';
import './index.scss';
import { Provider } from 'react-redux';
import { store } from './core/store/store';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ResourcesCalendar />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();
