import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPatientProfileQuery } from './get_patient_profile.query';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { PatientNotFoundException } from 'src/domain/patient/exceptions/patient.exceptions';
import { Role } from 'src/domain/user/value_objects/role.enum';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';
import { Clinic } from 'src/domain/clinic/entities/clinic.entity';

// Define a type for the patient clinic relation with clinic data
interface PatientClinicWithClinic {
  patientClinic: PatientClinic;
  clinic: Clinic | null;
}

@Injectable()
@QueryHandler(GetPatientProfileQuery)
export class GetPatientProfileHandler
  implements IQueryHandler<GetPatientProfileQuery>
{
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(query: GetPatientProfileQuery) {
    const { patientId, clinicIds, requestedBy } = query;

    // Retrieve patient global profile
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new PatientNotFoundException(patientId);
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

      // If the request is for clinic-specific context
      if (clinicIds && clinicIds.length > 0) {
        // Verify user has access to at least one of the specified clinics
        const userClinics = await this.clinicRepository.findByUser(
          requestedBy.userId,
        );
        const hasClinicAccess = clinicIds.some((clinicId) =>
          userClinics.some((userClinic) => userClinic.id === clinicId),
        );

        if (!hasClinicAccess) {
          throw new UnauthorizedException('No access to specified clinics');
        }
      }

      // Check user role
      if (!allowedRoles.includes(requestedBy.userRole as Role)) {
        throw new UnauthorizedException(
          'Insufficient permissions to access patient profile',
        );
      }
    }

    // Fetch patient-clinic relations
    let patientClinics: Array<PatientClinicWithClinic | null> = [];

    if (clinicIds && clinicIds.length > 0) {
      // Fetch patient clinics for specified clinics
      patientClinics = await Promise.all(
        clinicIds.map(async (clinicId) => {
          const patientClinic =
            await this.patientClinicRepository.findByPatientAndClinic(
              patientId,
              clinicId,
            );

          if (patientClinic) {
            const clinic = await this.clinicRepository.findById(clinicId);
            return { patientClinic, clinic };
          }
          return null;
        }),
      );
      // Filter out null results
      patientClinics = patientClinics.filter((pc) => pc !== null);
    } else {
      // If no specific clinics are specified, fetch all patient clinics
      const allPatientClinics =
        await this.patientClinicRepository.findByPatient(patientId);

      patientClinics = await Promise.all(
        allPatientClinics.map(async (pc) => {
          const clinic = await this.clinicRepository.findById(pc.clinicId);
          return { patientClinic: pc, clinic };
        }),
      );
    }

    return {
      patient,
      patientClinics,
    };
  }
}
