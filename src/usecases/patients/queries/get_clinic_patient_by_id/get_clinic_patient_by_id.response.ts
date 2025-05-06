import { Patient } from 'src/domain/patient/entities/patient.entity';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';

// Response DTO for retrieving a patient's details in a specific clinic
export class GetClinicPatientByIdResponse {
  // Global patient information
  patient: Patient;

  // Clinic-specific patient information
  patientClinic: PatientClinic;

  // Clinic ID
  clinicId: string;

  constructor(data: {
    patient: Patient;
    patientClinic: PatientClinic;
    clinicId: string;
  }) {
    this.patient = data.patient;
    this.patientClinic = data.patientClinic;
    this.clinicId = data.clinicId;
  }

  // Method to create a sanitized public response
  toPublicResponse() {
    return {
      // Global patient info
      patientId: this.patient.id,
      name: this.patient.name,
      gender: this.patient.gender,
      phone: this.patient.phone,
      birthDate: this.patient.birthDate,

      // Clinic-specific info
      patientNumber: this.patientClinic.patientNumber,
      firstVisitDate: this.patientClinic.firstVisitDate,
      lastVisitDate: this.patientClinic.lastVisitDate,
      isActive: this.patientClinic.isActive,

      clinicId: this.clinicId,
    };
  }

  // Optional method to create a detailed response for authorized users
  toDetailedResponse() {
    return {
      ...this.toPublicResponse(),

      // Additional sensitive information for authorized users
      email: this.patient.email,
      address: this.patient.address,
      emergencyContact: this.patient.emergencyContact,
      emergencyPhone: this.patient.emergencyPhone,

      // Clinic-specific detailed info
      medicalHistory: this.patientClinic.medicalHistory,
      note: this.patientClinic.note,
    };
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    patient: Patient;
    patientClinic: PatientClinic;
    clinicId: string;
  }): GetClinicPatientByIdResponse {
    return new GetClinicPatientByIdResponse(result);
  }
}
