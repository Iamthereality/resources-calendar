import { AutoServiceInterface } from './auto-service.interface';

interface ApiResponse {
  code?: number;
  success?: boolean;
  data?: any;
}

export interface GetAutoServicesResponse extends ApiResponse {
  data: AutoServiceInterface[];
}
