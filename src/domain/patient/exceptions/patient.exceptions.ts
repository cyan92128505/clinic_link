export class PatientNotFoundException extends Error {
  constructor(id: string) {
    super(`Patient with id ${id} not found`);
    this.name = 'PatientNotFoundException';
  }
}

export class PatientAlreadyExistsException extends Error {
  constructor(nationalId: string) {
    super(`Patient with national ID ${nationalId} already exists`);
    this.name = 'PatientAlreadyExistsException';
  }
}
