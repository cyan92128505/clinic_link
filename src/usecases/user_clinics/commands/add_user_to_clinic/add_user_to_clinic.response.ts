import { Role } from 'src/domain/user/value_objects/role.enum';

// Response DTO for adding a user to a clinic
export class AddUserToClinicResponse {
  // User unique identifier
  userId: string;

  // Clinic unique identifier
  clinicId: string;

  // User's role in the clinic
  role: Role;

  // Timestamp of user-clinic association creation
  createdAt: Date;

  constructor(data: {
    userId: string;
    clinicId: string;
    role: Role;
    createdAt: Date;
  }) {
    this.userId = data.userId;
    this.clinicId = data.clinicId;
    this.role = data.role;
    this.createdAt = data.createdAt;
  }

  // Method to create a simplified response
  toSimpleResponse() {
    return {
      userId: this.userId,
      clinicId: this.clinicId,
      role: this.role,
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

    return `使用者已成功新增至診所，角色為：${roleLabels[this.role] || this.role}`;
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    userId: string;
    clinicId: string;
    role: Role;
    createdAt: Date;
  }): AddUserToClinicResponse {
    return new AddUserToClinicResponse(result);
  }
}
