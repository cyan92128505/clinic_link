import { Appointment } from '../entities/appointment.entity';
import { IClinicAwareRepository } from 'src/domain/common/interfaces/clinlic.aware.respository.interface';
import { AppointmentStatus } from '../value_objects/appointment.enum';

/**
 * Repository interface for appointment operations
 * Extends the base repository with clinic-specific methods
 */
export interface IAppointmentRepository
  extends IClinicAwareRepository<Appointment> {
  // Override findById to add clinicId parameter
  findById(id: string, clinicId: string): Promise<Appointment | null>;

  // Override other methods to ensure clinic context is always present
  findAll(
    clinicId: string,
    date: string | undefined,
    status: AppointmentStatus | undefined,
  ): Promise<Appointment[]>;
  create(data: Appointment, clinicId: string): Promise<Appointment>;
  update(
    id: string,
    data: Partial<Appointment>,
    clinicId: string,
  ): Promise<Appointment>;
  delete(id: string, clinicId: string): Promise<boolean>;
}
