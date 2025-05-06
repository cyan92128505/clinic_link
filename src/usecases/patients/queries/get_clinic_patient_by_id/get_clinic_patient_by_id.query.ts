// Query to retrieve a patient's details in a specific clinic
export class GetClinicPatientByIdQuery {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // Patient unique identifier
    public readonly patientId: string,

    // Optional: User requesting the information (for access control)
    public readonly requestedBy?: {
      userId: string;
      userRole: string;
    },
  ) {}
}
