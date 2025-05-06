import { Role } from 'src/domain/user/value_objects/role.enum';

// Role description data structure
interface RoleDescription {
  value: Role; // Enum value
  label: string; // Human-readable label
  description: string; // Detailed role explanation
}

// Response DTO for retrieving all roles
export class GetAllRolesResponse {
  // List of role descriptions
  roles: RoleDescription[];

  constructor(data: { roles: RoleDescription[] }) {
    this.roles = data.roles;
  }

  // Method to get roles as simple array
  toSimpleResponse() {
    return {
      roles: this.roles.map((role) => ({
        value: role.value,
        label: role.label,
      })),
    };
  }

  // Method to get detailed role information
  toDetailedResponse() {
    return {
      roles: this.roles,
    };
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    roles: RoleDescription[];
  }): GetAllRolesResponse {
    return new GetAllRolesResponse(result);
  }
}
