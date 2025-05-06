import {
  AppointmentSource,
  AppointmentStatus,
} from 'src/domain/appointment/value_objects/appointment.enum';

export interface CreatePatientAppointmentResponse {
  appointmentId: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  appointmentTime?: Date;
  status: AppointmentStatus;
  source: AppointmentSource;
  message: string;
  createdAt?: Date;
}
