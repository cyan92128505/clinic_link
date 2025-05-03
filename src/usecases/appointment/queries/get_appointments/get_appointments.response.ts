import { Appointment } from '../../../../domain/appointment/entities/appointment.entity';
import {
  AppointmentStatus,
  AppointmentSource,
} from '../../../../domain/appointment/value_objects/appointment.enum';

export class AppointmentResponse {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  roomId?: string;
  roomName?: string;
  appointmentNumber?: number;
  appointmentTime?: string;
  checkinTime?: string;
  startTime?: string;
  endTime?: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  note?: string;
  createdAt: string;
  updatedAt: string;

  constructor(
    appointment: Appointment,
    patientName?: string,
    doctorName?: string,
    roomName?: string,
  ) {
    this.id = appointment.id;
    this.patientId = appointment.patientId;
    this.patientName = patientName;
    this.doctorId = appointment.doctorId;
    this.doctorName = doctorName;
    this.roomId = appointment.roomId;
    this.roomName = roomName;
    this.appointmentNumber = appointment.appointmentNumber;
    this.appointmentTime = appointment.appointmentTime?.toISOString();
    this.checkinTime = appointment.checkinTime?.toISOString();
    this.startTime = appointment.startTime?.toISOString();
    this.endTime = appointment.endTime?.toISOString();
    this.status = appointment.status;
    this.source = appointment.source;
    this.note = appointment.note;
    this.createdAt = appointment.createdAt?.toISOString() ?? '';
    this.updatedAt = appointment.updatedAt?.toISOString() ?? '';
  }
}

export class GetAppointmentsResponse {
  appointments: AppointmentResponse[];

  constructor(appointments: AppointmentResponse[]) {
    this.appointments = appointments;
  }
}
