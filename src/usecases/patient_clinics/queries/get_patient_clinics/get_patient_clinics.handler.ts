import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GetPatientClinicsQuery } from './get_patient_clinics.query';
import {
  GetPatientClinicsResponse,
  PatientClinicDto,
} from './get_patient_clinics.response';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { IAppointmentRepository } from 'src/domain/appointment/interfaces/appointment.repository.interface';

@Injectable()
export class GetPatientClinicsHandler {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,

    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    query: GetPatientClinicsQuery,
  ): Promise<GetPatientClinicsResponse> {
    // Check if patient exists
    const patient = await this.patientRepository.findById(query.patientId);
    if (!patient) {
      throw new NotFoundException(
        `Patient with id ${query.patientId} not found`,
      );
    }

    // Get all patient-clinic relationships
    const patientClinics = await this.patientClinicRepository.findByPatient(
      query.patientId,
    );

    // Filter inactive clinics if requested
    const filteredPatientClinics = query.includeInactive
      ? patientClinics
      : patientClinics.filter((pc) => pc.isActive);

    // Build response with clinic details
    const clinicDtos = await Promise.all(
      filteredPatientClinics.map(async (patientClinic) => {
        // Get clinic details
        const clinic = await this.clinicRepository.findById(
          patientClinic.clinicId,
        );

        if (!clinic) {
          // Skip if clinic doesn't exist (shouldn't happen in normal operation)
          return null;
        }

        // Get appointments count for this patient in this clinic
        const appointments = await this.appointmentRepository.findByPatient(
          patientClinic.clinicId,
          query.patientId,
        );

        const totalVisits = appointments.length;

        return {
          clinicId: clinic.id,
          clinicName: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          patientNumber: patientClinic.patientNumber,
          firstVisitDate: patientClinic.firstVisitDate,
          lastVisitDate: patientClinic.lastVisitDate,
          totalVisits: totalVisits,
          isActive: patientClinic.isActive,
          createdAt: patientClinic.createdAt,
          updatedAt: patientClinic.updatedAt,
        } as PatientClinicDto;
      }),
    );

    // Filter out null values (from skipped clinics)
    const validClinicDtos = clinicDtos.filter((dto) => dto !== null);

    // Sort by last visit date, most recent first
    validClinicDtos.sort(
      (a, b) =>
        new Date(b.lastVisitDate).getTime() -
        new Date(a.lastVisitDate).getTime(),
    );

    // Return response
    return {
      patientId: patient.id,
      patientName: patient.name,
      clinics: validClinicDtos,
    };
  }
}
