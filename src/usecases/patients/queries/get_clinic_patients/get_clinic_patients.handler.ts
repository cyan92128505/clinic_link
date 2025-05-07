import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicPatientsQuery } from './get_clinic_patients.query';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Role } from 'src/domain/user/value_objects/role.enum';

@Injectable()
@QueryHandler(GetClinicPatientsQuery)
export class GetClinicPatientsHandler
  implements IQueryHandler<GetClinicPatientsQuery>
{
  constructor(
    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,

    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(query: GetClinicPatientsQuery) {
    const {
      clinicId,
      pagination = { page: 1, limit: 20 },
      requestedBy,
    } = query;
    // Removed unused sorting variable

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Access control
    if (requestedBy) {
      const allowedRoles = [
        Role.ADMIN,
        Role.CLINIC_ADMIN,
        Role.DOCTOR,
        Role.NURSE,
        Role.RECEPTIONIST,
      ];

      if (!allowedRoles.includes(requestedBy.userRole as Role)) {
        throw new UnauthorizedException(
          'Insufficient permissions to access patient list',
        );
      }
    }

    // Prepare query parameters
    const { page = 1, limit = 20 } = pagination;
    // Removed unused offset variable

    // Fetch patient clinics with filtering and sorting
    // Note: Applied filters directly in findByClinic method call
    const patientClinics =
      await this.patientClinicRepository.findByClinic(clinicId);

    // Fetch full patient details
    const patientsDetails = await Promise.all(
      patientClinics.map(async (patientClinic) => {
        const patient = await this.patientRepository.findById(
          patientClinic.patientId,
        );
        return { patient, patientClinic };
      }),
    );

    // Count total patients matching the filter
    const totalPatients = patientClinics.length;

    return {
      patients: patientsDetails,
      pagination: {
        page,
        limit,
        total: totalPatients,
        totalPages: Math.ceil(totalPatients / limit),
      },
      clinicId,
    };
  }
}
