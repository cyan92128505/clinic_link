import { Appointment } from '../entities/appointment.entity';

export interface IAppointmentRepository {
  findById(id: string, clinicId: string): Promise<Appointment | null>;
  findAll(
    clinicId: string,
    filters?: Partial<Appointment>,
  ): Promise<Appointment[]>;
  create(appointment: Appointment): Promise<Appointment>;
  update(
    id: string,
    clinicId: string,
    data: Partial<Appointment>,
  ): Promise<Appointment>;
  delete(id: string, clinicId: string): Promise<boolean>;
  findByStatus(clinicId: string, status: string[]): Promise<Appointment[]>;
  findByDoctor(clinicId: string, doctorId: string): Promise<Appointment[]>;
  findByPatient(clinicId: string, patientId: string): Promise<Appointment[]>;
  findByRoom(clinicId: string, roomId: string): Promise<Appointment[]>;
  findByDate(clinicId: string, date: Date): Promise<Appointment[]>;
  updateStatus(
    id: string,
    clinicId: string,
    status: string,
  ): Promise<Appointment>;
}
