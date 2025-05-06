export class GetPatientAppointmentByIdQuery {
  constructor(
    public readonly appointmentId: string,
    public readonly clinicId: string,
    public readonly patientId: string,
  ) {}
}
