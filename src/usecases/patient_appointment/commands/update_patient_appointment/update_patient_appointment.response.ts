import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';

export interface UpdatePatientAppointmentResponse {
  appointmentId: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  appointmentTime?: Date;
  status: AppointmentStatus;
  note?: string;
  message: string;
  updatedAt?: Date;
}
