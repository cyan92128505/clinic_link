import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateClinicPatientCommand } from './create_clinic_patient.command';
import { CreateClinicPatientResponse } from './create_clinic_patient.response';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Patient } from 'src/domain/patient/entities/patient.entity';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';
import {
  PatientAlreadyExistsException,
  DuplicatePatientNumberException,
} from 'src/domain/patient/exceptions/patient.exceptions';

@Injectable()
@CommandHandler(CreateClinicPatientCommand)
export class CreateClinicPatientHandler
  implements ICommandHandler<CreateClinicPatientCommand>
{
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(
    command: CreateClinicPatientCommand,
  ): Promise<CreateClinicPatientResponse> {
    // Check if clinic exists
    const clinic = await this.clinicRepository.findById(command.clinicId);
    if (!clinic) {
      throw new NotFoundException(
        `Clinic with id ${command.clinicId} not found`,
      );
    }

    // Check if patient already exists with the same nationalId (if provided)
    if (command.nationalId) {
      const existingPatientByNationalId =
        await this.patientRepository.findByNationalId(command.nationalId);
      if (existingPatientByNationalId) {
        // Patient exists globally, check if already linked to this clinic
        const existingLink =
          await this.patientClinicRepository.findByPatientAndClinic(
            existingPatientByNationalId.id,
            command.clinicId,
          );

        if (existingLink) {
          throw new PatientAlreadyExistsException(
            command.nationalId,
            'nationalId',
          );
        } else {
          // Create a link for existing patient to this clinic
          return await this.linkExistingPatientToClinic(
            existingPatientByNationalId,
            command,
          );
        }
      }
    }

    // Check if patient already exists with the same phone
    const existingPatientsByPhone = await this.patientRepository.findByPhone(
      command.phone,
    );
    if (existingPatientsByPhone.length > 0) {
      // Check if any of these patients match other criteria (name, birthDate if provided)
      const matchingPatients = existingPatientsByPhone.filter(
        (p) =>
          p.name.toLowerCase() === command.name.toLowerCase() &&
          (!command.birthDate ||
            !p.birthDate ||
            p.birthDate.getTime() === new Date(command.birthDate).getTime()),
      );

      if (matchingPatients.length > 0) {
        // We found a likely match, check if already linked to this clinic
        const existingPatient = matchingPatients[0];
        const existingLink =
          await this.patientClinicRepository.findByPatientAndClinic(
            existingPatient.id,
            command.clinicId,
          );

        if (existingLink) {
          throw new PatientAlreadyExistsException(command.phone, 'phone');
        } else {
          // Create a link for existing patient to this clinic
          return await this.linkExistingPatientToClinic(
            existingPatient,
            command,
          );
        }
      }
    }

    // Check if patientNumber is already used in this clinic
    if (command.patientNumber) {
      const existingPatientWithNumber =
        await this.patientClinicRepository.findByPatientNumberInClinic(
          command.clinicId,
          command.patientNumber,
        );

      if (existingPatientWithNumber) {
        throw new DuplicatePatientNumberException(
          command.clinicId,
          command.patientNumber,
        );
      }
    }

    // Create new patient
    const patient = new Patient({
      name: command.name,
      phone: command.phone,
      nationalId: command.nationalId,
      birthDate: command.birthDate,
      gender: command.gender,
      email: command.email,
      address: command.address,
      emergencyContact: command.emergencyContact,
      emergencyPhone: command.emergencyPhone,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save patient
    const createdPatient = await this.patientRepository.create(patient);

    // Create patient-clinic link
    const now = new Date();
    const patientClinic = new PatientClinic({
      patientId: createdPatient.id,
      clinicId: command.clinicId,
      patientNumber: command.patientNumber,
      medicalHistory: command.medicalHistory,
      note: command.note,
      firstVisitDate: now,
      lastVisitDate: now,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Save patient-clinic link
    const createdLink =
      await this.patientClinicRepository.create(patientClinic);

    // Return response
    return {
      patientId: createdPatient.id,
      clinicId: clinic.id,
      patientNumber: createdLink.patientNumber,
      name: createdPatient.name,
      phone: createdPatient.phone,
      nationalId: createdPatient.nationalId,
      birthDate: createdPatient.birthDate,
      gender: createdPatient.gender,
      email: createdPatient.email,
      address: createdPatient.address,
      emergencyContact: createdPatient.emergencyContact,
      emergencyPhone: createdPatient.emergencyPhone,
      isActive: createdLink.isActive,
      createdAt: createdPatient.createdAt,
    };
  }

  private async linkExistingPatientToClinic(
    existingPatient: Patient,
    command: CreateClinicPatientCommand,
  ): Promise<CreateClinicPatientResponse> {
    // Check if patientNumber is already used in this clinic
    if (command.patientNumber) {
      const existingPatientWithNumber =
        await this.patientClinicRepository.findByPatientNumberInClinic(
          command.clinicId,
          command.patientNumber,
        );

      if (existingPatientWithNumber) {
        throw new DuplicatePatientNumberException(
          command.clinicId,
          command.patientNumber,
        );
      }
    }

    // Create patient-clinic link
    const now = new Date();
    const patientClinic = new PatientClinic({
      patientId: existingPatient.id,
      clinicId: command.clinicId,
      patientNumber: command.patientNumber,
      medicalHistory: command.medicalHistory,
      note: command.note,
      firstVisitDate: now,
      lastVisitDate: now,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Save patient-clinic link
    const createdLink =
      await this.patientClinicRepository.create(patientClinic);

    // Return response
    return {
      patientId: existingPatient.id,
      clinicId: command.clinicId,
      patientNumber: createdLink.patientNumber,
      name: existingPatient.name,
      phone: existingPatient.phone,
      nationalId: existingPatient.nationalId,
      birthDate: existingPatient.birthDate,
      gender: existingPatient.gender,
      email: existingPatient.email,
      address: existingPatient.address,
      emergencyContact: existingPatient.emergencyContact,
      emergencyPhone: existingPatient.emergencyPhone,
      isActive: createdLink.isActive,
      createdAt: existingPatient.createdAt,
    };
  }
}
