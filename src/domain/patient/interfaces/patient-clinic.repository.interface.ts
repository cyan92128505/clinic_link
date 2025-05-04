import { PatientClinic } from '../entities/patient-clinic.entity';

export interface IPatientClinicRepository {
  findByPatientAndClinic(
    patientId: string,
    clinicId: string,
  ): Promise<PatientClinic | null>;
  findByPatient(patientId: string): Promise<PatientClinic[]>;
  findByClinic(clinicId: string): Promise<PatientClinic[]>;
  create(patientClinic: PatientClinic): Promise<PatientClinic>;
  update(
    patientId: string,
    clinicId: string,
    data: Partial<PatientClinic>,
  ): Promise<PatientClinic>;
  delete(patientId: string, clinicId: string): Promise<boolean>;

  // Clinic-specific queries
  findByPatientNumberInClinic(
    clinicId: string,
    patientNumber: string,
  ): Promise<PatientClinic | null>;
  findActivePatientsByClinic(clinicId: string): Promise<PatientClinic[]>;
}
