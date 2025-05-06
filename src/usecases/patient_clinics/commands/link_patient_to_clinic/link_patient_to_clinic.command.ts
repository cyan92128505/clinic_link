export class LinkPatientToClinicCommand {
  constructor(
    public readonly patientId: string,
    public readonly clinicId: string,
    public readonly patientNumber?: string,
    public readonly medicalHistory?: Record<string, any>,
    public readonly note?: string,
  ) {}
}
