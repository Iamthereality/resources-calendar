import { AutoServiceInterface } from './auto-service.interface';

interface ApiResponse {
  code: number;
  success: boolean;
  data?: any;
}

export interface GetAutoServiceResponse extends ApiResponse {
  data: AutoServiceInterface;
}

export interface GetAutoServicesResponse extends ApiResponse {
  data: AutoServiceInterface[];
}
