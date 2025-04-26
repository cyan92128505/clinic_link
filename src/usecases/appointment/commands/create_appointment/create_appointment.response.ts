import { Appointment } from '../../../../domain/appointment/entities/appointment.entity';
import {
  AppointmentStatus,
  AppointmentSource,
} from '../../../../domain/appointment/value_objects/appointment.enum';

export class CreateAppointmentResponse {
  id: string;
  patientId: string;
  doctorId?: string;
  roomId?: string;
  appointmentNumber?: number;
  appointmentTime?: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  note?: string;
  createdAt: string;
  updatedAt: string;

  constructor(appointment: Appointment) {
    this.id = appointment.id;
    this.patientId = appointment.patientId;
    this.doctorId = appointment.doctorId;
    this.roomId = appointment.roomId;
    this.appointmentNumber = appointment.appointmentNumber;
    this.appointmentTime = appointment.appointmentTime?.toISOString();
    this.status = appointment.status;
    this.source = appointment.source;
    this.note = appointment.note;
    this.createdAt = appointment.createdAt.toISOString();
    this.updatedAt = appointment.updatedAt.toISOString();
  }
}
