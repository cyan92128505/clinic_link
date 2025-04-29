import { BaseEntity } from 'src/domain/common/entities/base.entity';
import {
  AppointmentSource,
  AppointmentStatus,
} from '../value_objects/appointment.enum';

export class Appointment extends BaseEntity {
  clinicId: string;
  patientId: string;
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

  constructor(props: Partial<Appointment>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.status = props.status || AppointmentStatus.SCHEDULED;
    this.source = props.source || AppointmentSource.WALK_IN;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
