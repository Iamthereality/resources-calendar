import { Observable } from 'rxjs';
import { ajax, AjaxResponse } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

const requestHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

export const getRawData = (): Observable<any> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/crm.deal.userfield.list.json?filter[USER_TYPE_ID]=resourcebooking`,
    method: 'GET',
    headers: requestHeaders
  }).pipe(
    map((data: AjaxResponse) => data.response),
    map((response: any) => response)
  );
};

export const getAutoServices = (id: string): Observable<any> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/crm.deal.userfield.get.json?id=${id}`,
    method: 'GET',
    headers: requestHeaders
  }).pipe(
    map((data: AjaxResponse) => data.response),
    map((response: any) => response)
  );
};
