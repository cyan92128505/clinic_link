import { Appointment } from '../../../../domain/appointment/entities/appointment.entity';
import {
  AppointmentStatus,
  AppointmentSource,
} from '../../../../domain/appointment/value_objects/appointment.enum';

export class UpdateAppointmentResponse {
  id: string;
  patientId: string;
  doctorId?: string;
  roomId?: string;
  appointmentNumber?: number;
  appointmentTime?: string;
  checkinTime?: string;
  startTime?: string;
  endTime?: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  note?: string;
  updatedAt: string;

  constructor(appointment: Appointment) {
    this.id = appointment.id;
    this.patientId = appointment.patientId;
    this.doctorId = appointment.doctorId;
    this.roomId = appointment.roomId;
    this.appointmentNumber = appointment.appointmentNumber;
    this.appointmentTime = appointment.appointmentTime?.toISOString();
    this.checkinTime = appointment.checkinTime?.toISOString();
    this.startTime = appointment.startTime?.toISOString();
    this.endTime = appointment.endTime?.toISOString();
    this.status = appointment.status;
    this.source = appointment.source;
    this.note = appointment.note;
    this.updatedAt = appointment.updatedAt?.toISOString() ?? '';
  }
}
