import { Patient } from '../entities/patient.entity';

export interface IPatientRepository {
  findById(id: string): Promise<Patient | null>;
  findAll(filters?: Partial<Patient>): Promise<Patient[]>;
  create(patient: Patient): Promise<Patient>;
  update(id: string, data: Partial<Patient>): Promise<Patient>;
  delete(id: string): Promise<boolean>;

  findByFirebaseUid(firebaseUid: string): Promise<Patient | null>;
  findByNationalId(nationalId: string): Promise<Patient | null>;
  findByPhone(phone: string): Promise<Patient[]>;
  search(query: string): Promise<Patient[]>;
}
