import { Role } from 'src/domain/user/value_objects/role.enum';

// Response DTO for updating a user's role in a clinic
export class UpdateUserRoleResponse {
  // User unique identifier
  userId: string;

  // Clinic unique identifier
  clinicId: string;

  // Previous role of the user
  previousRole: Role;

  // New role of the user
  newRole: Role;

  constructor(data: {
    userId: string;
    clinicId: string;
    previousRole: Role;
    newRole: Role;
  }) {
    this.userId = data.userId;
    this.clinicId = data.clinicId;
    this.previousRole = data.previousRole;
    this.newRole = data.newRole;
  }

  // Method to create a simplified response
  toSimpleResponse() {
    return {
      userId: this.userId,
      clinicId: this.clinicId,
      newRole: this.newRole,
    };
  }

  // Method to provide a human-readable description
  getDescription(): string {
    const roleLabels = {
      [Role.ADMIN]: '系統管理員',
      [Role.CLINIC_ADMIN]: '診所管理員',
      [Role.DOCTOR]: '醫生',
      [Role.NURSE]: '護士',
      [Role.STAFF]: '一般員工',
      [Role.RECEPTIONIST]: '櫃檯人員',
    };

    return `使用者角色已從 ${roleLabels[this.previousRole] || this.previousRole} 更新至 ${roleLabels[this.newRole] || this.newRole}`;
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    userId: string;
    clinicId: string;
    previousRole: Role;
    newRole: Role;
  }): UpdateUserRoleResponse {
    return new UpdateUserRoleResponse(result);
  }
}
