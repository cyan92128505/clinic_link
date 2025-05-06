import { Role } from 'src/domain/user/value_objects/role.enum';

// Command for removing a user from a clinic
export class RemoveUserFromClinicCommand {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // User unique identifier to be removed
    public readonly userId: string,

    // User performing the action (for audit purposes)
    public readonly removedBy: {
      userId: string;
      userRole: string;
    },
  ) {}
}
