import { Gender } from 'src/domain/patient/value_objects/gender.enum';

export class CreateClinicPatientCommand {
  constructor(
    public readonly clinicId: string,
    public readonly name: string,
    public readonly phone: string,
    public readonly nationalId?: string,
    public readonly birthDate?: Date,
    public readonly gender?: Gender,
    public readonly email?: string,
    public readonly address?: string,
    public readonly emergencyContact?: string,
    public readonly emergencyPhone?: string,
    public readonly patientNumber?: string,
    public readonly medicalHistory?: Record<string, any>,
    public readonly note?: string,
  ) {}
}
