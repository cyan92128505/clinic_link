export class GetPatientMedicalRecordsQuery {
  constructor(
    public readonly patientId: string,
    public readonly clinicId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
