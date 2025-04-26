import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';

/**
 * Extension of base repository that adds clinic awareness
 * Clinic-specific repositories should extend this instead of IBaseRepository
 */
export interface IClinicAwareRepository<T> {
  findById(id: string, clinicId: string): Promise<T | null>;
  findAll(
    clinicId: string,
    date: string | undefined,
    status: AppointmentStatus | undefined,
  ): Promise<T[]>;
  create(data: T, clinicId: string): Promise<T>;
  update(id: string, data: Partial<T>, clinicId: string): Promise<T>;
  delete(id: string, clinicId: string): Promise<boolean>;
}
