import { Role } from 'src/domain/user/value_objects/role.enum';

// Command for updating a user's role in a clinic
export class UpdateUserRoleCommand {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // User unique identifier
    public readonly userId: string,

    // New role for the user
    public readonly newRole: Role,

    // User performing the action (for audit purposes)
    public readonly updatedBy: {
      userId: string;
      userRole: string;
    },
  ) {}
}
