import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LinkPatientToClinicCommand } from './link_patient_to_clinic.command';
import { LinkPatientToClinicResponse } from './link_patient_to_clinic.response';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';
import {
  PatientNotFoundException,
  DuplicatePatientNumberException,
} from 'src/domain/patient/exceptions/patient.exceptions';

@Injectable()
@CommandHandler(LinkPatientToClinicCommand)
export class LinkPatientToClinicHandler
  implements ICommandHandler<LinkPatientToClinicCommand>
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
    command: LinkPatientToClinicCommand,
  ): Promise<LinkPatientToClinicResponse> {
    // Check if patient exists
    const patient = await this.patientRepository.findById(command.patientId);
    if (!patient) {
      throw new PatientNotFoundException(command.patientId);
    }

    // Check if clinic exists
    const clinic = await this.clinicRepository.findById(command.clinicId);
    if (!clinic) {
      throw new NotFoundException(
        `Clinic with id ${command.clinicId} not found`,
      );
    }

    // Check if patient is already linked to this clinic
    const existingLink =
      await this.patientClinicRepository.findByPatientAndClinic(
        command.patientId,
        command.clinicId,
      );

    if (existingLink) {
      // If the link exists but is inactive, reactivate it
      if (!existingLink.isActive) {
        const reactivatedLink = await this.patientClinicRepository.update(
          command.patientId,
          command.clinicId,
          {
            isActive: true,
            lastVisitDate: new Date(),
            updatedAt: new Date(),
            note: command.note
              ? existingLink.note
                ? `${existingLink.note}\n${command.note}`
                : command.note
              : existingLink.note,
          },
        );

        return {
          patientId: reactivatedLink.patientId,
          clinicId: reactivatedLink.clinicId,
          patientNumber: reactivatedLink.patientNumber,
          isActive: reactivatedLink.isActive,
          firstVisitDate: reactivatedLink.firstVisitDate,
          lastVisitDate: reactivatedLink.lastVisitDate,
          message: 'Patient-clinic relationship reactivated successfully',
          createdAt: reactivatedLink.createdAt,
        };
      }

      // If already active, update it if needed
      if (command.patientNumber || command.note || command.medicalHistory) {
        const updateData: Partial<PatientClinic> = {
          lastVisitDate: new Date(),
          updatedAt: new Date(),
        };

        if (
          command.patientNumber &&
          command.patientNumber !== existingLink.patientNumber
        ) {
          // Check if patient number is already used in the clinic
          const patientWithNumber =
            await this.patientClinicRepository.findByPatientNumberInClinic(
              command.clinicId,
              command.patientNumber,
            );

          if (
            patientWithNumber &&
            patientWithNumber.patientId !== command.patientId
          ) {
            throw new DuplicatePatientNumberException(
              command.clinicId,
              command.patientNumber,
            );
          }

          updateData.patientNumber = command.patientNumber;
        }

        if (command.note) {
          updateData.note = existingLink.note
            ? `${existingLink.note}\n${command.note}`
            : command.note;
        }

        if (command.medicalHistory) {
          updateData.medicalHistory = {
            ...(existingLink.medicalHistory || {}),
            ...command.medicalHistory,
          };
        }

        const updatedLink = await this.patientClinicRepository.update(
          command.patientId,
          command.clinicId,
          updateData,
        );

        return {
          patientId: updatedLink.patientId,
          clinicId: updatedLink.clinicId,
          patientNumber: updatedLink.patientNumber,
          isActive: updatedLink.isActive,
          firstVisitDate: updatedLink.firstVisitDate,
          lastVisitDate: updatedLink.lastVisitDate,
          message: 'Patient-clinic relationship updated successfully',
          createdAt: updatedLink.createdAt,
        };
      }

      // If no updates needed, just return existing link
      return {
        patientId: existingLink.patientId,
        clinicId: existingLink.clinicId,
        patientNumber: existingLink.patientNumber,
        isActive: existingLink.isActive,
        firstVisitDate: existingLink.firstVisitDate,
        lastVisitDate: existingLink.lastVisitDate,
        message: 'Patient already linked to this clinic',
        createdAt: existingLink.createdAt,
      };
    }

    // If patient number provided, check if it's unique in the clinic
    if (command.patientNumber) {
      const patientWithNumber =
        await this.patientClinicRepository.findByPatientNumberInClinic(
          command.clinicId,
          command.patientNumber,
        );

      if (patientWithNumber) {
        throw new DuplicatePatientNumberException(
          command.clinicId,
          command.patientNumber,
        );
      }
    }

    // Create new patient-clinic link
    const now = new Date();
    const patientClinic = new PatientClinic({
      patientId: command.patientId,
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

    const createdLink =
      await this.patientClinicRepository.create(patientClinic);

    return {
      patientId: createdLink.patientId,
      clinicId: createdLink.clinicId,
      patientNumber: createdLink.patientNumber,
      isActive: createdLink.isActive,
      firstVisitDate: createdLink.firstVisitDate,
      lastVisitDate: createdLink.lastVisitDate,
      message: 'Patient linked to clinic successfully',
      createdAt: createdLink.createdAt,
    };
  }
}
