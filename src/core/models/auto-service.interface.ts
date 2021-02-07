export interface AutoServiceInterface {
  id: string;
  address: string;
}

export interface EmployeeInterface {
  id: string;
  name: string;
  surname: string;
  lastName: string;
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
  status: string;
}

export interface ProvidedService {
  id: string;
  name: string;
}
