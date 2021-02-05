import { Observable } from 'rxjs';
import { ajax, AjaxResponse } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { AutoServicesResponse, ProvidedServicesResponse, ResourcesResponse } from '../models/api.interface';

const requestHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

export const getAutoServices = (): Observable<AutoServicesResponse> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/services.php`,
    method: 'GET',
    headers: requestHeaders
  }).pipe(map((resp: AjaxResponse) => resp.response));
};

export const getAutoServiceResources = (serviceId: string): Observable<ResourcesResponse> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/resources.php`,
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({ serviceId })
  }).pipe(map((resp: AjaxResponse) => resp.response));
};

export const getDeals = (serviceId: string): Observable<any> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/deals.php`,
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({ serviceId })
  }).pipe(map((resp: AjaxResponse) => resp.response));
};

export const getProvidedServices = (serviceId: string): Observable<ProvidedServicesResponse> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/provided-services.php`,
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({ serviceId })
  }).pipe(map((resp: AjaxResponse) => resp.response));
};
