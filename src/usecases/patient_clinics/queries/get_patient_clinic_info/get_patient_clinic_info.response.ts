export interface GetPatientClinicInfoResponse {
  patientId: string;
  clinicId: string;
  clinicName: string;
  patientNumber?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  firstVisitDate: Date;
  lastVisitDate: Date;
  totalVisits: number;
  isActive: boolean;
  medicalHistory?: Record<string, any>;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
