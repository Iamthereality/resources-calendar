import { OfficeInterface } from './office.interface';

interface ApiResponse {
  code: number;
  success: boolean;
  data?: any;
}

export interface GetOfficeResponse extends ApiResponse {
  data: OfficeInterface;
}

export interface GetOfficesResponse extends ApiResponse {
  data: OfficeInterface[];
}
