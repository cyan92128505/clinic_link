export class PatientNotFoundException extends Error {
  constructor(id: string) {
    super(`Patient with id ${id} not found`);
    this.name = 'PatientNotFoundException';
  }
}

export class PatientAlreadyExistsException extends Error {
  constructor(
    identifier: string,
    type: 'nationalId' | 'firebaseUid' | 'phone',
  ) {
    super(`Patient with ${type} ${identifier} already exists`);
    this.name = 'PatientAlreadyExistsException';
  }
}

export class PatientClinicRelationNotFoundException extends Error {
  constructor(patientId: string, clinicId: string) {
    super(
      `Patient-clinic relation not found for patient ${patientId} and clinic ${clinicId}`,
    );
    this.name = 'PatientClinicRelationNotFoundException';
  }
}

export class DuplicatePatientNumberException extends Error {
  constructor(clinicId: string, patientNumber: string) {
    super(
      `Patient number ${patientNumber} already exists in clinic ${clinicId}`,
    );
    this.name = 'DuplicatePatientNumberException';
  }
}
