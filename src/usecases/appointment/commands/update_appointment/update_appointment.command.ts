import { AppointmentStatus } from '../../../../domain/appointment/value_objects/appointment.enum';

export class UpdateAppointmentCommand {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly status?: AppointmentStatus,
    public readonly doctorId?: string,
    public readonly roomId?: string,
    public readonly appointmentTime?: string,
    public readonly note?: string,
  ) {}
}
