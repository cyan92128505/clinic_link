import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClinicPatientCommand } from './update_clinic_patient.command';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { PatientClinicRelationNotFoundException } from 'src/domain/patient/exceptions/patient.exceptions';
import { DuplicatePatientNumberException } from 'src/domain/patient/exceptions/patient.exceptions';
import { PatientNumber } from 'src/domain/patient/value_objects/phone_number.vo';

@Injectable()
@CommandHandler(UpdateClinicPatientCommand)
export class UpdateClinicPatientHandler
  implements ICommandHandler<UpdateClinicPatientCommand>
{
  constructor(
    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,

    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(command: UpdateClinicPatientCommand) {
    const { clinicId, patientId, data } = command;

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Verify patient exists
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Check existing patient-clinic relation
    const existingPatientClinic =
      await this.patientClinicRepository.findByPatientAndClinic(
        patientId,
        clinicId,
      );

    if (!existingPatientClinic) {
      throw new PatientClinicRelationNotFoundException(patientId, clinicId);
    }

    // Validate patient number uniqueness if provided
    if (data.patientNumber) {
      // Use value object for validation
      new PatientNumber(data.patientNumber);

      // Check if patient number is already used in this clinic
      const existingWithPatientNumber =
        await this.patientClinicRepository.findByPatientNumberInClinic(
          clinicId,
          data.patientNumber,
        );

      if (
        existingWithPatientNumber &&
        existingWithPatientNumber.patientId !== patientId
      ) {
        throw new DuplicatePatientNumberException(clinicId, data.patientNumber);
      }
    }

    // Update patient clinic relation
    await this.patientClinicRepository.update(patientId, clinicId, {
      ...data,
      updatedAt: new Date(),
    });

    return {
      patientId,
      clinicId,
      updatedFields: Object.keys(data),
    };
  }
}
