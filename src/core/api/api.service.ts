import { Observable } from 'rxjs';
import { ajax, AjaxResponse } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { GetAutoServicesResponse } from '../models/api.interface';

const requestHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

export const getAutoServices = (): Observable<GetAutoServicesResponse> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/services.php`,
    method: 'GET',
    headers: requestHeaders
  }).pipe(map((resp: AjaxResponse) => resp.response));
};

export const getAutoServiceResources = (serviceId: string): Observable<any> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/getres.php`,
    method: 'POST',
    headers: requestHeaders,
    body: { serviceId }
  }).pipe(map((resp: AjaxResponse) => resp.response));
};
