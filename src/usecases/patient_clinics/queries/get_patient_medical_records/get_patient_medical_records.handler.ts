import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GetPatientMedicalRecordsQuery } from './get_patient_medical_records.query';
import {
  GetPatientMedicalRecordsResponse,
  MedicalRecordDto,
} from './get_patient_medical_records.response';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { PatientClinicRelationNotFoundException } from 'src/domain/patient/exceptions/patient.exceptions';

// Define Medication interface to match MedicalRecordDto
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Define Prescription interface to match MedicalRecordDto
interface Prescription {
  medications: Medication[];
}

// Define Medical Record interface
interface MedicalRecord {
  id: string;
  appointmentId?: string;
  recordDate: string; // ISO date string
  recordType: string;
  diagnosis: string;
  symptoms: string[];
  prescription?: Prescription | string; // Could be string in old format or object in new format
  treatment: string;
  notes: string;
  doctorId: string;
  doctorName: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Define Medical History interface
interface MedicalHistory {
  records?: MedicalRecord[];
}

@Injectable()
export class GetPatientMedicalRecordsHandler {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(
    query: GetPatientMedicalRecordsQuery,
  ): Promise<GetPatientMedicalRecordsResponse> {
    // Check if patient exists
    const patient = await this.patientRepository.findById(query.patientId);
    if (!patient) {
      throw new NotFoundException(
        `Patient with id ${query.patientId} not found`,
      );
    }

    // Check if clinic exists
    const clinic = await this.clinicRepository.findById(query.clinicId);
    if (!clinic) {
      throw new NotFoundException(`Clinic with id ${query.clinicId} not found`);
    }

    // Check if patient is linked to this clinic
    const patientClinic =
      await this.patientClinicRepository.findByPatientAndClinic(
        query.patientId,
        query.clinicId,
      );

    if (!patientClinic) {
      throw new PatientClinicRelationNotFoundException(
        query.patientId,
        query.clinicId,
      );
    }

    // Get medical records from the patient-clinic relationship
    const medicalHistory =
      (patientClinic.medicalHistory as MedicalHistory) || {};

    // Extract records array (assuming the structure is { records: [...] })
    const allRecords: MedicalRecord[] = medicalHistory.records || [];

    // Filter records by date if specified
    let filteredRecords: MedicalRecord[] = [...allRecords];

    if (query.startDate) {
      const startDate = new Date(query.startDate);
      filteredRecords = filteredRecords.filter(
        (record) => new Date(record.recordDate) >= startDate,
      );
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      filteredRecords = filteredRecords.filter(
        (record) => new Date(record.recordDate) <= endDate,
      );
    }

    // Sort records by date, most recent first
    filteredRecords.sort(
      (a, b) =>
        new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime(),
    );

    // Calculate total and pagination
    const total = filteredRecords.length;
    const totalPages = Math.ceil(total / query.limit);
    const start = (query.page - 1) * query.limit;
    const end = start + query.limit;

    // Slice records for pagination
    const paginatedRecords = filteredRecords.slice(start, end);

    // Map to DTOs with proper type handling for required fields
    const recordDtos = paginatedRecords.map((record) => {
      // Convert prescription to the correct format if needed
      let prescriptionObject: Prescription = { medications: [] };

      // If prescription exists, convert it to the right format if it's a string
      if (record.prescription) {
        if (typeof record.prescription === 'string') {
          // Convert string prescription to object format with a single medication
          prescriptionObject = {
            medications: [
              {
                name: record.prescription,
                dosage: '',
                frequency: '',
                duration: '',
              },
            ],
          };
        } else {
          // It's already in object format, use it
          prescriptionObject = record.prescription;
        }
      }

      // Create the DTO with all required fields
      const dto: MedicalRecordDto = {
        id: record.id,
        recordDate: new Date(record.recordDate),
        recordType: record.recordType || '',
        diagnosis: record.diagnosis || '',
        symptoms: record.symptoms || [],
        prescription: prescriptionObject,
        treatment: record.treatment || '',
        notes: record.notes || '',
        doctorId: record.doctorId || '',
        doctorName: record.doctorName || '',
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      };

      // Only add appointmentId if it exists
      if (record.appointmentId) {
        dto.appointmentId = record.appointmentId;
      }

      return dto;
    });

    // Return response
    return {
      patientId: patient.id,
      patientName: patient.name,
      clinicId: clinic.id,
      clinicName: clinic.name,
      patientNumber: patientClinic.patientNumber,
      records: recordDtos,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }
}
