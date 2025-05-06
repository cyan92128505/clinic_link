import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicPatientByIdQuery } from './get_clinic_patient_by_id.query';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import {
  PatientNotFoundException,
  PatientClinicRelationNotFoundException,
} from 'src/domain/patient/exceptions/patient.exceptions';
import { Role } from 'src/domain/user/value_objects/role.enum';

@Injectable()
@QueryHandler(GetClinicPatientByIdQuery)
export class GetClinicPatientByIdHandler
  implements IQueryHandler<GetClinicPatientByIdQuery>
{
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(query: GetClinicPatientByIdQuery) {
    const { clinicId, patientId, requestedBy } = query;

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Verify patient exists
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new PatientNotFoundException(patientId);
    }

    // Check patient-clinic relation
    const patientClinic =
      await this.patientClinicRepository.findByPatientAndClinic(
        patientId,
        clinicId,
      );

    if (!patientClinic) {
      throw new PatientClinicRelationNotFoundException(patientId, clinicId);
    }

    // Optional: Access control
    if (requestedBy) {
      // Define roles that can access patient information
      const allowedRoles = [
        Role.ADMIN,
        Role.CLINIC_ADMIN,
        Role.DOCTOR,
        Role.NURSE,
        Role.RECEPTIONIST,
      ];

      // Basic role-based access control
      if (!allowedRoles.includes(requestedBy.userRole as Role)) {
        throw new UnauthorizedException(
          'Insufficient permissions to access patient information',
        );
      }
    }

    // Return comprehensive patient information
    return {
      patient,
      patientClinic,
      clinicId,
    };
  }
}
