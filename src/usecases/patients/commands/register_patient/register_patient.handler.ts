import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterPatientCommand } from './register_patient.command';
import { RegisterPatientResponse } from './register_patient.response';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { Patient } from 'src/domain/patient/entities/patient.entity';
import { PatientAlreadyExistsException } from 'src/domain/patient/exceptions/patient.exceptions';

@Injectable()
@CommandHandler(RegisterPatientCommand)
export class RegisterPatientHandler
  implements ICommandHandler<RegisterPatientCommand>
{
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(
    command: RegisterPatientCommand,
  ): Promise<RegisterPatientResponse> {
    // Validate firebase UID
    if (!command.firebaseUid) {
      throw new BadRequestException('Firebase UID is required');
    }

    // Check if patient already exists with the same firebase UID
    const existingPatientByFirebaseUid =
      await this.patientRepository.findByFirebaseUid(command.firebaseUid);
    if (existingPatientByFirebaseUid) {
      throw new PatientAlreadyExistsException(
        command.firebaseUid,
        'firebaseUid',
      );
    }

    // Check if patient already exists with the same nationalId (if provided)
    if (command.nationalId) {
      const existingPatientByNationalId =
        await this.patientRepository.findByNationalId(command.nationalId);
      if (existingPatientByNationalId) {
        // If patient exists with the same nationalId but different firebase UID,
        // we could update the existing patient with the new firebase UID,
        // but for now, we'll throw an exception
        throw new PatientAlreadyExistsException(
          command.nationalId,
          'nationalId',
        );
      }
    }

    // Check if patient already exists with the same phone and name
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
        // A patient with the same phone and name already exists
        // Similar to the nationalId case, we could update the existing patient,
        // but for simplicity, we'll throw an exception
        throw new PatientAlreadyExistsException(command.phone, 'phone');
      }
    }

    // Create new patient
    const patient = new Patient({
      firebaseUid: command.firebaseUid,
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

    // Return response
    return {
      patientId: createdPatient.id,
      firebaseUid: createdPatient.firebaseUid!,
      name: createdPatient.name,
      phone: createdPatient.phone,
      nationalId: createdPatient.nationalId,
      birthDate: createdPatient.birthDate,
      gender: createdPatient.gender,
      email: createdPatient.email,
      address: createdPatient.address,
      emergencyContact: createdPatient.emergencyContact,
      emergencyPhone: createdPatient.emergencyPhone,
      message: 'Patient registered successfully',
      createdAt: createdPatient.createdAt,
    };
  }
}
