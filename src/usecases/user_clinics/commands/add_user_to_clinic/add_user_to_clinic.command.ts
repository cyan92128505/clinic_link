import { Role } from 'src/domain/user/value_objects/role.enum';

// Command for adding a user to a clinic
export class AddUserToClinicCommand {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // User unique identifier
    public readonly userId: string,

    // Role in the clinic
    public readonly role: Role,

    // User performing the action (for audit purposes)
    public readonly addedBy: {
      userId: string;
      userRole: string;
    },
  ) {}
}
