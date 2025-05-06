import { AppointmentSource } from 'src/domain/appointment/value_objects/appointment.enum';

export class CreatePatientAppointmentCommand {
  constructor(
    public readonly clinicId: string,
    public readonly patientId: string,
    public readonly doctorId?: string,
    public readonly departmentId?: string,
    public readonly appointmentTime?: Date,
    public readonly note?: string,
    public readonly source: AppointmentSource = AppointmentSource.ONLINE,
  ) {}
}
