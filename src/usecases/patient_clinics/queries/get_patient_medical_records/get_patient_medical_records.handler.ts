import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetPatientMedicalRecordsQuery } from './get_patient_medical_records.query';
import {
  GetPatientMedicalRecordsResponse,
  MedicalRecordDto,
} from './get_patient_medical_records.response';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { PatientClinicRelationNotFoundException } from 'src/domain/patient/exceptions/patient.exceptions';

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
    const medicalHistory = patientClinic.medicalHistory || {};

    // Extract records array (assuming the structure is { records: [...] })
    // If structure is different, this needs to be adapted
    const allRecords: any[] = medicalHistory.records || [];

    // Filter records by date if specified
    let filteredRecords = [...allRecords];

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

    // Map to DTOs
    const recordDtos: MedicalRecordDto[] = paginatedRecords.map((record) => ({
      id: record.id,
      appointmentId: record.appointmentId,
      recordDate: new Date(record.recordDate),
      recordType: record.recordType,
      diagnosis: record.diagnosis,
      symptoms: record.symptoms,
      prescription: record.prescription,
      treatment: record.treatment,
      notes: record.notes,
      doctorId: record.doctorId,
      doctorName: record.doctorName,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    }));

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
