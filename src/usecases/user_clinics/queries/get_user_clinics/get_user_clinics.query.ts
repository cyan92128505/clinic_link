import { Role } from 'src/domain/user/value_objects/role.enum';

// Query to retrieve clinics for a specific user
export class GetUserClinicsQuery {
  constructor(
    // User unique identifier
    public readonly userId: string,

    // User requesting the information (for access control)
    public readonly requestedBy: {
      userId: string;
      userRole: string;
    },

    // Optional: Filter by specific roles in the clinic
    public readonly roles?: Role[],

    // Optional: Include additional clinic details
    public readonly includeDetails?: boolean,
  ) {}
}
