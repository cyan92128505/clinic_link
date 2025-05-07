import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GetPatientClinicInfoQuery } from './get_patient_clinic_info.query';
import { GetPatientClinicInfoResponse } from './get_patient_clinic_info.response';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { IAppointmentRepository } from 'src/domain/appointment/interfaces/appointment.repository.interface';
import { PatientClinicRelationNotFoundException } from 'src/domain/patient/exceptions/patient.exceptions';

@Injectable()
export class GetPatientClinicInfoHandler {
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
    query: GetPatientClinicInfoQuery,
  ): Promise<GetPatientClinicInfoResponse> {
    // Get patient information
    const patient = await this.patientRepository.findById(query.patientId);
    if (!patient) {
      throw new NotFoundException(
        `Patient with id ${query.patientId} not found`,
      );
    }

    // Get clinic information
    const clinic = await this.clinicRepository.findById(query.clinicId);
    if (!clinic) {
      throw new NotFoundException(`Clinic with id ${query.clinicId} not found`);
    }

    // Get patient-clinic relationship
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

    // Count total visits (appointments) to this clinic
    const appointments = await this.appointmentRepository.findByPatient(
      query.clinicId,
      query.patientId,
    );

    const totalVisits = appointments.length;

    // Construct response
    return {
      patientId: patient.id,
      clinicId: clinic.id,
      clinicName: clinic.name,
      patientNumber: patientClinic.patientNumber,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientEmail: patient.email,
      firstVisitDate: patientClinic.firstVisitDate,
      lastVisitDate: patientClinic.lastVisitDate,
      totalVisits: totalVisits,
      isActive: patientClinic.isActive,
      medicalHistory: patientClinic.medicalHistory,
      note: patientClinic.note,
      createdAt: patientClinic.createdAt,
      updatedAt: patientClinic.updatedAt,
    };
  }
}
