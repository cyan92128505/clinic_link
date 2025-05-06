// Response DTO for updating a patient's information in a specific clinic
export class UpdateClinicPatientResponse {
  // Patient unique identifier
  patientId: string;

  // Clinic unique identifier
  clinicId: string;

  // List of fields that were updated
  updatedFields: string[];

  constructor(data: {
    patientId: string;
    clinicId: string;
    updatedFields: string[];
  }) {
    this.patientId = data.patientId;
    this.clinicId = data.clinicId;
    this.updatedFields = data.updatedFields;
  }

  // Optional method to create a response from handler result
  static fromHandler(result: {
    patientId: string;
    clinicId: string;
    updatedFields: string[];
  }): UpdateClinicPatientResponse {
    return new UpdateClinicPatientResponse(result);
  }
}
