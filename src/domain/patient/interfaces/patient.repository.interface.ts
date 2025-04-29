import { Patient } from '../entities/patient.entity';

export interface IPatientRepository {
  findById(id: string, clinicId: string): Promise<Patient | null>;
  findAll(clinicId: string, filters?: Partial<Patient>): Promise<Patient[]>;
  create(patient: Patient): Promise<Patient>;
  update(
    id: string,
    clinicId: string,
    data: Partial<Patient>,
  ): Promise<Patient>;
  delete(id: string, clinicId: string): Promise<boolean>;
  findByNationalId(
    clinicId: string,
    nationalId: string,
  ): Promise<Patient | null>;
  findByPhone(clinicId: string, phone: string): Promise<Patient[]>;
  search(clinicId: string, query: string): Promise<Patient[]>;
}
