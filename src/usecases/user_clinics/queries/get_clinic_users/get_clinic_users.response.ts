import { User } from 'src/domain/user/entities/user.entity';
import { Role } from 'src/domain/user/value_objects/role.enum';

// Response DTO for retrieving users in a clinic
export class GetClinicUsersResponse {
  // List of users
  users: User[];

  // Pagination metadata
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Clinic ID
  clinicId: string;

  constructor(data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    clinicId: string;
  }) {
    this.users = data.users;
    this.pagination = data.pagination;
    this.clinicId = data.clinicId;
  }

  // Method to create a public response with sanitized information
  toPublicResponse() {
    return {
      clinicId: this.clinicId,
      users: this.users.map((user) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      })),
      pagination: this.pagination,
    };
  }

  // Method to create a detailed response for authorized users
  toDetailedResponse() {
    return {
      clinicId: this.clinicId,
      users: this.users.map((user) => ({
        // All public information
        ...this.toPublicResponse().users.find((u) => u.userId === user.id),

        // Additional sensitive information
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: this.pagination,
    };
  }

  // Helper method to get roles for users
  getUserRoles(users: User[]): Record<string, Role> {
    // This method would typically be implemented in the repository layer
    // For now, it's a placeholder
    return {};
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    clinicId: string;
  }): GetClinicUsersResponse {
    return new GetClinicUsersResponse(result);
  }
}
