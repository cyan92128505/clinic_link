import { Clinic } from '../entities/clinic.entity';

export interface IClinicRepository {
  findById(id: string): Promise<Clinic | null>;
  findAll(): Promise<Clinic[]>;
  create(clinic: Clinic): Promise<Clinic>;
  update(id: string, data: Partial<Clinic>): Promise<Clinic>;
  delete(id: string): Promise<boolean>;
  findByUser(userId: string): Promise<Clinic[]>;
}
