import { Patient } from 'src/domain/patient/entities/patient.entity';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';

// Response DTO for retrieving patients in a specific clinic
export class GetClinicPatientsResponse {
  // List of patients with their clinic-specific information
  patients: Array<{
    patient: Patient;
    patientClinic: PatientClinic;
  }>;

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
    patients: Array<{
      patient: Patient;
      patientClinic: PatientClinic;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    clinicId: string;
  }) {
    this.patients = data.patients;
    this.pagination = data.pagination;
    this.clinicId = data.clinicId;
  }

  // Method to create a public response with sanitized information
  toPublicResponse() {
    return {
      patients: this.patients.map(({ patient, patientClinic }) => ({
        // Basic patient information
        patientId: patient.id,
        name: patient.name,
        phone: patient.phone,
        gender: patient.gender,
        age: patient.getAge(),

        // Clinic-specific patient information
        patientNumber: patientClinic.patientNumber,
        firstVisitDate: patientClinic.firstVisitDate,
        lastVisitDate: patientClinic.lastVisitDate,
        isActive: patientClinic.isActive,
      })),
      pagination: this.pagination,
      clinicId: this.clinicId,
    };
  }

  // Method to create a detailed response for authorized users
  toDetailedResponse() {
    return {
      patients: this.patients.map(({ patient, patientClinic }) => ({
        // All public information
        ...this.toPublicResponse().patients.find(
          (p) => p.patientId === patient.id,
        ),

        // Additional sensitive information
        email: patient.email,
        address: patient.address,
        birthDate: patient.birthDate,
        emergencyContact: patient.emergencyContact,
        emergencyPhone: patient.emergencyPhone,

        // Clinic-specific detailed information
        medicalHistory: patientClinic.medicalHistory,
        note: patientClinic.note,
      })),
      pagination: this.pagination,
      clinicId: this.clinicId,
    };
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    patients: Array<{
      patient: Patient;
      patientClinic: PatientClinic;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    clinicId: string;
  }): GetClinicPatientsResponse {
    return new GetClinicPatientsResponse(result);
  }
}
