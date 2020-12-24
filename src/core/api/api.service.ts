import { Observable } from 'rxjs';
import { ajax, AjaxResponse } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { OfficeInterface } from '../models/office.interface';
import { GetOfficesResponse } from '../models/api.interface';

const requestHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

export const getBitrixOffices = (): Observable<GetOfficesResponse> => {
  return ajax({
    url: `${process.env.REACT_APP_API_URL}/offices`,
    method: 'GET',
    headers: requestHeaders
  }).pipe(
    map((data: AjaxResponse) => data.response),
    map((response: GetOfficesResponse) => response)
  );
};
