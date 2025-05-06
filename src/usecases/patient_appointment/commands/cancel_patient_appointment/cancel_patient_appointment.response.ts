import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';

export interface CancelPatientAppointmentResponse {
  appointmentId: string;
  clinicId: string;
  patientId: string;
  status: AppointmentStatus;
  message: string;
  cancelledAt?: Date;
}
