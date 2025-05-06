import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';

export class UpdatePatientAppointmentCommand {
  constructor(
    public readonly appointmentId: string,
    public readonly clinicId: string,
    public readonly patientId: string,
    public readonly doctorId?: string,
    public readonly appointmentTime?: Date,
    public readonly note?: string,
    public readonly status?: AppointmentStatus,
  ) {}
}
