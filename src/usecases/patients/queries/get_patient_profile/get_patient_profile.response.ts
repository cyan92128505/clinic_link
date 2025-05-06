import { Patient } from 'src/domain/patient/entities/patient.entity';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';
import { Clinic } from 'src/domain/clinic/entities/clinic.entity';

// Response DTO for retrieving a patient's global profile
export class GetPatientProfileResponse {
  // Global patient information
  patient: Patient;

  // Patient's clinic relations
  patientClinics: Array<{
    patientClinic: PatientClinic;
    clinic: Clinic | null;
  }>;

  constructor(data: {
    patient: Patient;
    patientClinics: Array<{
      patientClinic: PatientClinic;
      clinic: Clinic | null;
    }>;
  }) {
    this.patient = data.patient;
    this.patientClinics = data.patientClinics;
  }

  // Method to create a public response with basic information
  toPublicResponse() {
    return {
      // Global patient information
      patientId: this.patient.id,
      name: this.patient.name,
      gender: this.patient.gender,
      phone: this.patient.phone,
      age: this.patient.getAge(),

      // Clinic relations summary
      clinics: this.patientClinics.map(({ patientClinic, clinic }) => ({
        clinicId: clinic?.id,
        clinicName: clinic?.name,
        patientNumber: patientClinic.patientNumber,
        firstVisitDate: patientClinic.firstVisitDate,
        lastVisitDate: patientClinic.lastVisitDate,
        isActive: patientClinic.isActive,
      })),
    };
  }

  // Method to create a detailed response for authorized users
  toDetailedResponse() {
    return {
      // All public information
      ...this.toPublicResponse(),

      // Additional sensitive information
      birthDate: this.patient.birthDate,
      email: this.patient.email,
      address: this.patient.address,
      emergencyContact: this.patient.emergencyContact,
      emergencyPhone: this.patient.emergencyPhone,

      // More detailed clinic relations
      clinics: this.patientClinics.map(({ patientClinic, clinic }) => ({
        // All previous clinic information
        ...this.toPublicResponse().clinics.find(
          (c) => c.clinicId === clinic?.id,
        ),

        // Additional clinic-specific details
        medicalHistory: patientClinic.medicalHistory,
        note: patientClinic.note,
        clinicAddress: clinic?.address,
        clinicPhone: clinic?.phone,
      })),
    };
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    patient: Patient;
    patientClinics: Array<{
      patientClinic: PatientClinic;
      clinic: Clinic | null;
    }>;
  }): GetPatientProfileResponse {
    return new GetPatientProfileResponse(result);
  }
}
