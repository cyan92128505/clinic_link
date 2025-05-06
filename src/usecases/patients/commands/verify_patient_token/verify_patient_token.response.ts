import { Patient } from 'src/domain/patient/entities/patient.entity';

// Response DTO for patient token verification
export class VerifyPatientTokenResponse {
  // Patient entity
  patient: Patient;

  // Firebase UID
  firebaseUid: string;

  // Optional email from Firebase
  email?: string;

  // Optional phone number from Firebase
  phoneNumber?: string;

  constructor(data: {
    patient: Patient;
    firebaseUid: string;
    email?: string;
    phoneNumber?: string;
  }) {
    this.patient = data.patient;
    this.firebaseUid = data.firebaseUid;
    this.email = data.email;
    this.phoneNumber = data.phoneNumber;
  }

  // Method to create a response from handler result
  static fromHandler(result: {
    patient: Patient;
    firebaseUid: string;
    email?: string;
    phoneNumber?: string;
  }): VerifyPatientTokenResponse {
    return new VerifyPatientTokenResponse(result);
  }

  // Optional method to sanitize sensitive information if needed
  toPublicResponse() {
    return {
      patientId: this.patient.id,
      firebaseUid: this.firebaseUid,
      // Exclude sensitive information
    };
  }
}
