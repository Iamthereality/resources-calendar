import { AutoServiceInterface, DealInterface, ProvidedService, ResourcesInterface } from './auto-service.interface';

interface ApiResponse {
  code?: number;
  success?: boolean;
  data?: any;
}

export interface AutoServicesResponse extends ApiResponse {
  data: AutoServiceInterface[];
}

export interface ResourcesResponse extends ApiResponse {
  data: ResourcesInterface;
}

export interface DealsResponse extends ApiResponse {
  data: DealInterface[];
}

export interface ProvidedServicesResponse extends ApiResponse {
  data: ProvidedService[];
}
