import { Observable } from 'rxjs';
import { ajax, AjaxResponse } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { GetOfficesResponse } from '../models/api.interface';

const requestHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

// export const getBitrixOffices = (): Observable<GetOfficesResponse> => {
//   return ajax({
//     url: `${process.env.REACT_APP_API_URL}/offices`,
//     method: 'GET',
//     headers: requestHeaders
//   }).pipe(
//     map((data: AjaxResponse) => data.response),
//     map((response: GetOfficesResponse) => response)
//   );
// };

export const getBitrixOffices = (): Observable<any> => {
  return ajax({
    url: `https://bazis-motors.bitrix24.ru/rest/9/spnymubmmqyr1312/profile.json`,
    method: 'GET',
    headers: requestHeaders
  }).pipe(
    map((data: AjaxResponse) => data.response),
    map((response: any) => response)
  );
};
