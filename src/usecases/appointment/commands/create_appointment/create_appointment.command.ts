import { AppointmentSource } from '../../../../domain/appointment/value_objects/appointment.enum';

export class CreateAppointmentCommand {
  constructor(
    public readonly clinicId: string,
    public readonly patientId: string,
    public readonly doctorId?: string,
    public readonly departmentId?: string,
    public readonly appointmentTime?: Date,
    public readonly source: AppointmentSource = AppointmentSource.WALK_IN,
    public readonly note?: string,
  ) {}
}
