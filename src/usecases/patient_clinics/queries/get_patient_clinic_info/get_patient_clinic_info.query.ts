export class GetPatientClinicInfoQuery {
  constructor(
    public readonly patientId: string,
    public readonly clinicId: string,
  ) {}
}
