import {
  AppointmentSource,
  AppointmentStatus,
} from 'src/domain/appointment/value_objects/appointment.enum';

export interface AppointmentDto {
  id: string;
  clinicId: string;
  clinicName?: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  roomId?: string;
  roomName?: string;
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

export interface GetPatientAppointmentsResponse {
  appointments: AppointmentDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
