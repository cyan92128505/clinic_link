export interface LinkPatientToClinicResponse {
  patientId: string;
  clinicId: string;
  patientNumber?: string;
  isActive: boolean;
  firstVisitDate?: Date;
  lastVisitDate?: Date;
  message: string;
  createdAt?: Date;
}
