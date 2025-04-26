import { AppointmentStatus } from '../../../../domain/appointment/value_objects/appointment.enum';

export class GetAppointmentsQuery {
  constructor(
    public readonly clinicId: string,
    public readonly date?: string,
    public readonly status?: AppointmentStatus,
  ) {}
}
