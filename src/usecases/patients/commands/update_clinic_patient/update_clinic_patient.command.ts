// Command representing the update of a patient's information in a specific clinic
export class UpdateClinicPatientCommand {
  constructor(
    // Clinic context
    public readonly clinicId: string,

    // Patient identification
    public readonly patientId: string,

    // Optional update fields for PatientClinic
    public readonly data: {
      patientNumber?: string;
      medicalHistory?: Record<string, any>;
      note?: string;
      isActive?: boolean;
      firstVisitDate?: Date;
      lastVisitDate?: Date;
    },

    // User performing the update (for audit purposes)
    public readonly updatedBy: string,
  ) {}
}
