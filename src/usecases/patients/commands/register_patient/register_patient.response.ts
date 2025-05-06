import { Gender } from 'src/domain/patient/value_objects/gender.enum';

export interface RegisterPatientResponse {
  patientId: string;
  firebaseUid: string;
  name: string;
  phone: string;
  nationalId?: string;
  birthDate?: Date;
  gender?: Gender;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  message: string;
  createdAt?: Date;
}
