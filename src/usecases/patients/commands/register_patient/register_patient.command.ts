import { Gender } from 'src/domain/patient/value_objects/gender.enum';

export class RegisterPatientCommand {
  constructor(
    public readonly firebaseUid: string,
    public readonly name: string,
    public readonly phone: string,
    public readonly nationalId?: string,
    public readonly birthDate?: Date,
    public readonly gender?: Gender,
    public readonly email?: string,
    public readonly address?: string,
    public readonly emergencyContact?: string,
    public readonly emergencyPhone?: string,
  ) {}
}
