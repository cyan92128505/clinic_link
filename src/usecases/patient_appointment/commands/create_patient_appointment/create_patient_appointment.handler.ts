import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePatientAppointmentCommand } from './create_patient_appointment.command';
import { CreatePatientAppointmentResponse } from './create_patient_appointment.response';
import { IAppointmentRepository } from 'src/domain/appointment/interfaces/appointment.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import {
  AppointmentStatus,
  AppointmentSource,
} from 'src/domain/appointment/value_objects/appointment.enum';
import { Appointment } from 'src/domain/appointment/entities/appointment.entity';
import { PatientClinicRelationNotFoundException } from 'src/domain/patient/exceptions/patient.exceptions';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';

@Injectable()
@CommandHandler(CreatePatientAppointmentCommand)
export class CreatePatientAppointmentHandler
  implements ICommandHandler<CreatePatientAppointmentCommand>
{
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,

    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(
    command: CreatePatientAppointmentCommand,
  ): Promise<CreatePatientAppointmentResponse> {
    // Check if clinic exists
    const clinic = await this.clinicRepository.findById(command.clinicId);
    if (!clinic) {
      throw new NotFoundException(
        `Clinic with id ${command.clinicId} not found`,
      );
    }

    // Check if patient is associated with this clinic
    const patientClinic =
      await this.patientClinicRepository.findByPatientAndClinic(
        command.patientId,
        command.clinicId,
      );

    if (!patientClinic) {
      // If not found, attempt to link patient to clinic
      try {
        await this.patientClinicRepository.create({
          patientId: command.patientId,
          clinicId: command.clinicId,
          firstVisitDate: new Date(),
          lastVisitDate: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PatientClinic);
      } catch (error) {
        if (error instanceof Error) {
          throw new PatientClinicRelationNotFoundException(
            command.patientId,
            command.clinicId,
          );
        }
      }
    } else if (!patientClinic.isActive) {
      throw new BadRequestException(
        `Patient is not active in clinic ${command.clinicId}`,
      );
    }

    // Validate appointment time if provided
    if (command.appointmentTime) {
      const appointmentDate = new Date(command.appointmentTime);

      // Check if appointment date is in the past
      if (appointmentDate < new Date()) {
        throw new BadRequestException('Appointment time cannot be in the past');
      }

      // Additional business validation could be added here
      // e.g., check clinic working hours, doctor availability, etc.
    }

    // Create new appointment
    const appointment = new Appointment({
      clinicId: command.clinicId,
      patientId: command.patientId,
      doctorId: command.doctorId,
      appointmentTime: command.appointmentTime,
      status: AppointmentStatus.SCHEDULED,
      source: command.source || AppointmentSource.ONLINE,
      note: command.note,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save appointment
    const createdAppointment =
      await this.appointmentRepository.create(appointment);

    // Update patient's last visit date
    if (patientClinic) {
      await this.patientClinicRepository.update(
        command.patientId,
        command.clinicId,
        { lastVisitDate: new Date(), updatedAt: new Date() },
      );
    }

    // Return response
    return {
      appointmentId: createdAppointment.id,
      clinicId: createdAppointment.clinicId,
      patientId: createdAppointment.patientId,
      doctorId: createdAppointment.doctorId,
      appointmentTime: createdAppointment.appointmentTime,
      status: createdAppointment.status,
      source: createdAppointment.source,
      message: 'Appointment created successfully',
      createdAt: createdAppointment.createdAt,
    };
  }
}
