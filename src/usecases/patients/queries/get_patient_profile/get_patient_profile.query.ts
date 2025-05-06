// Query to retrieve a patient's global profile
export class GetPatientProfileQuery {
  constructor(
    // Patient unique identifier
    public readonly patientId: string,

    // Optional: List of clinics to fetch patient-clinic relations
    public readonly clinicIds?: string[],

    // Optional: User requesting the information (for access control)
    public readonly requestedBy?: {
      userId: string;
      userRole: string;
    },
  ) {}
}
