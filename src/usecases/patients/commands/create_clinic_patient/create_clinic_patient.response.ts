import { Gender } from 'src/domain/patient/value_objects/gender.enum';

export interface CreateClinicPatientResponse {
  patientId: string;
  clinicId: string;
  patientNumber?: string;
  name: string;
  phone: string;
  nationalId?: string;
  birthDate?: Date;
  gender?: Gender;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  isActive: boolean;
  createdAt?: Date;
}
