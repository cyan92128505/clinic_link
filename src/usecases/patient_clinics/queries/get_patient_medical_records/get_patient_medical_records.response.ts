export interface MedicalRecordDto {
  id: string;
  appointmentId?: string;
  recordDate: Date;
  recordType: string;
  diagnosis?: string;
  symptoms?: string[];
  prescription?: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
  };
  treatment?: string;
  notes?: string;
  doctorId?: string;
  doctorName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetPatientMedicalRecordsResponse {
  patientId: string;
  patientName: string;
  clinicId: string;
  clinicName: string;
  patientNumber?: string;
  records: MedicalRecordDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
