export class PatientNumber {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    // Patient number format validation (customizable per clinic)
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('Patient number cannot be empty');
    }

    // Example: Accept alphanumeric characters and dashes
    const patientNumberRegex = /^[A-Za-z0-9-]+$/;
    if (!patientNumberRegex.test(this.value)) {
      throw new Error('Invalid patient number format');
    }
  }

  getValue(): string {
    return this.value;
  }
}
