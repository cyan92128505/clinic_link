export interface PatientClinicDto {
  clinicId: string;
  clinicName: string;
  address?: string;
  phone?: string;
  patientNumber?: string;
  firstVisitDate: Date;
  lastVisitDate: Date;
  totalVisits: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetPatientClinicsResponse {
  patientId: string;
  patientName: string;
  clinics: PatientClinicDto[];
}
