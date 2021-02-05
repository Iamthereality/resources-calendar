export interface AutoServiceInterface {
  id: string;
  address: string;
}

export interface EmployeeInterface {
  name: string;
  surname: string;
  lastname: string;
  schedule: [];
  serviceType?: string;
}

export interface ResourcesInterface {
  acceptors: EmployeeInterface[];
  mechanics: EmployeeInterface[];
}

export interface DealInterface {
  id: string;
  title: string;
  providedServiceId: number;
  acceptorId: number;
  mechanicId: number;
  start: string;
  end: string;
}

export interface ProvidedService {
  id: string;
  name: string;
}
