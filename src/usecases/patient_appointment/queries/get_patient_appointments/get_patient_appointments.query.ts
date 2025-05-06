import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';

export class GetPatientAppointmentsQuery {
  constructor(
    public readonly patientId: string,
    public readonly clinicId?: string,
    public readonly status?: AppointmentStatus[],
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
