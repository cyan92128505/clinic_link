// Query to retrieve patients in a specific clinic
export class GetClinicPatientsQuery {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // Optional pagination parameters
    public readonly pagination?: {
      page?: number;
      limit?: number;
    },

    // Optional filtering parameters
    public readonly filters?: {
      search?: string; // Search by name, phone, or patient number
      isActive?: boolean; // Filter by active status
      fromDate?: Date; // Patients registered from this date
      toDate?: Date; // Patients registered until this date
    },

    // Optional sorting
    public readonly sorting?: {
      field?: 'name' | 'lastVisitDate' | 'firstVisitDate' | 'createdAt';
      order?: 'ASC' | 'DESC';
    },

    // Optional: User requesting the information (for access control)
    public readonly requestedBy?: {
      userId: string;
      userRole: string;
    },
  ) {}
}
