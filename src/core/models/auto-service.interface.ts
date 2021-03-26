export interface AutoServiceInterface {
  id: string;
  address: string;
}

export interface EmployeeScheduleInterface {
  from: string;
  to: string;
}

export interface EmployeeInterface {
  id: string;
  name: string;
  surname: string;
  lastName: string;
  schedule: EmployeeScheduleInterface[];
  serviceType?: string;
}

export interface ResourcesInterface {
  acceptors: EmployeeInterface[];
  mechanics: EmployeeInterface[];
}

export interface DealInterface {
  id?: string;
  title?: string;
  leadId?: string;
  providedServiceId?: number;
  acceptorId?: number;
  mechanicId?: number;
  accept?: string;
  release?: string;
  status?: string;
}

export interface ProvidedService {
  id: string;
  name: string;
}
