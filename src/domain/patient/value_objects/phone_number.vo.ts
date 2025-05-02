export class PhoneNumber {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    // Taiwan phone number validation
    const phoneRegex = /^(09\d{8}|0[2-8]\d{7,8})$/;
    if (!phoneRegex.test(this.value)) {
      throw new Error('Invalid phone number format');
    }
  }

  getValue(): string {
    return this.value;
  }
}
