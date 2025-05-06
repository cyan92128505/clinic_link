export class CancelPatientAppointmentCommand {
  constructor(
    public readonly appointmentId: string,
    public readonly clinicId: string,
    public readonly patientId: string,
    public readonly cancelReason?: string,
  ) {}
}
