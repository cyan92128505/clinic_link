import { Clinic } from 'src/domain/clinic/entities/clinic.entity';
import { Role } from 'src/domain/user/value_objects/role.enum';

// Response DTO for retrieving a specific user's clinics
export class GetUserClinicsByIdResponse {
  // User unique identifier
  userId: string;

  // Optional specific clinic ID
  clinicId?: string;

  // List of clinics
  clinics: Clinic[];

  constructor(data: { userId: string; clinicId?: string; clinics: Clinic[] }) {
    this.userId = data.userId;
    this.clinicId = data.clinicId;
    this.clinics = data.clinics;
  }

  // Method to create a public response with basic information
  toPublicResponse() {
    return {
      userId: this.userId,
      clinicId: this.clinicId,
      clinics: this.clinics.map((clinic) => ({
        clinicId: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        logo: clinic.logo,
      })),
    };
  }

  // Method to create a detailed response for authorized users
  toDetailedResponse() {
    return {
      userId: this.userId,
      clinicId: this.clinicId,
      clinics: this.clinics.map((clinic) => ({
        // Basic clinic information
        clinicId: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        logo: clinic.logo,

        // Additional clinic details
        settings: clinic.settings,
        createdAt: clinic.createdAt,
        updatedAt: clinic.updatedAt,
      })),
    };
  }

  // Method to get user's role in the specified clinic
  getUserClinicRole(clinicId: string): Role | null {
    // Placeholder method - would typically be implemented in the repository layer
    return null;
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    userId: string;
    clinicId?: string;
    clinics: Clinic[];
  }): GetUserClinicsByIdResponse {
    return new GetUserClinicsByIdResponse(result);
  }
}
