import {
  AppointmentSource,
  AppointmentStatus,
} from 'src/domain/appointment/value_objects/appointment.enum';

export interface GetPatientAppointmentByIdResponse {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  patientNumber?: string;
  doctorId?: string;
  roomId?: string;
  appointmentNumber?: number;
  appointmentTime?: Date;
  checkinTime?: Date;
  startTime?: Date;
  endTime?: Date;
  status: AppointmentStatus;
  source: AppointmentSource;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
