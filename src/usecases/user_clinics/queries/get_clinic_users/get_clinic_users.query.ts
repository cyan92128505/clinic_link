import { Role } from 'src/domain/user/value_objects/role.enum';

// Query to retrieve users in a specific clinic
export class GetClinicUsersQuery {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // User requesting the information (for access control)
    public readonly requestedBy: {
      userId: string;
      userRole: string;
    },

    // Optional: Filter by specific roles
    public readonly roles?: Role[],

    // Optional: Pagination
    public readonly pagination?: {
      page?: number;
      limit?: number;
    },

    // Optional: Search term
    public readonly search?: string,
  ) {}
}
