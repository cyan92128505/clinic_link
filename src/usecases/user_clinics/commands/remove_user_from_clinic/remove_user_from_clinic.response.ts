import { Role } from 'src/domain/user/value_objects/role.enum';

// Response DTO for removing a user from a clinic
export class RemoveUserFromClinicResponse {
  // User unique identifier
  userId: string;

  // Clinic unique identifier
  clinicId: string;

  // Whether the user was successfully removed
  removed: boolean;

  constructor(data: { userId: string; clinicId: string; removed: boolean }) {
    this.userId = data.userId;
    this.clinicId = data.clinicId;
    this.removed = data.removed;
  }

  // Method to create a simplified response
  toSimpleResponse() {
    return {
      userId: this.userId,
      clinicId: this.clinicId,
      removed: this.removed,
    };
  }

  // Method to provide a human-readable description
  getDescription(): string {
    return this.removed ? `使用者已成功從診所移除` : `無法從診所移除使用者`;
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    userId: string;
    clinicId: string;
    removed: boolean;
  }): RemoveUserFromClinicResponse {
    return new RemoveUserFromClinicResponse(result);
  }
}
