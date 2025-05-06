export class GetPatientClinicsQuery {
  constructor(
    public readonly patientId: string,
    public readonly includeInactive: boolean = false,
  ) {}
}
