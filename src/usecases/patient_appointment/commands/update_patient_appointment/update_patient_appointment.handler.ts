import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePatientAppointmentCommand } from './update_patient_appointment.command';
import { UpdatePatientAppointmentResponse } from './update_patient_appointment.response';
import { IAppointmentRepository } from 'src/domain/appointment/interfaces/appointment.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';

@Injectable()
@CommandHandler(UpdatePatientAppointmentCommand)
export class UpdatePatientAppointmentHandler
  implements ICommandHandler<UpdatePatientAppointmentCommand>
{
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,

    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,
  ) {}

  async execute(
    command: UpdatePatientAppointmentCommand,
  ): Promise<UpdatePatientAppointmentResponse> {
    // Check if appointment exists
    const appointment = await this.appointmentRepository.findById(
      command.appointmentId,
      command.clinicId,
    );

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with id ${command.appointmentId} not found in clinic ${command.clinicId}`,
      );
    }

    // Verify that the appointment belongs to the patient
    if (appointment.patientId !== command.patientId) {
      throw new ForbiddenException(
        'You do not have permission to update this appointment',
      );
    }

    // Check if appointment can be updated (not completed, cancelled or no-show)
    const nonUpdatableStatuses = [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NO_SHOW,
    ];

    if (nonUpdatableStatuses.includes(appointment.status)) {
      throw new ForbiddenException(
        `Cannot update appointment with status ${appointment.status}`,
      );
    }

    // Check if status transition is valid for patient
    // Patients should only be able to change status to CANCELLED
    if (command.status && command.status !== AppointmentStatus.CANCELLED) {
      throw new ForbiddenException(
        `Patients can only cancel appointments, not change status to ${command.status}`,
      );
    }

    // Validate appointment time if provided
    if (command.appointmentTime) {
      const appointmentDate = new Date(command.appointmentTime);

      // Check if appointment date is in the past
      if (appointmentDate < new Date()) {
        throw new BadRequestException('Appointment time cannot be in the past');
      }

      // Additional time validation could be added here
    }

    // Prepare update data
    const updateData: Partial<any> = {
      updatedAt: new Date(),
    };

    if (command.doctorId) updateData.doctorId = command.doctorId;
    if (command.appointmentTime)
      updateData.appointmentTime = command.appointmentTime;
    if (command.note) updateData.note = command.note;
    if (command.status) updateData.status = command.status;

    // Update appointment
    const updatedAppointment = await this.appointmentRepository.update(
      command.appointmentId,
      command.clinicId,
      updateData,
    );

    // If appointment was updated successfully, update patient's last visit date
    if (updatedAppointment) {
      const patientClinic =
        await this.patientClinicRepository.findByPatientAndClinic(
          command.patientId,
          command.clinicId,
        );

      if (patientClinic) {
        await this.patientClinicRepository.update(
          command.patientId,
          command.clinicId,
          { updatedAt: new Date() },
        );
      }
    }

    // Return response
    return {
      appointmentId: updatedAppointment.id,
      clinicId: updatedAppointment.clinicId,
      patientId: updatedAppointment.patientId,
      doctorId: updatedAppointment.doctorId,
      appointmentTime: updatedAppointment.appointmentTime,
      status: updatedAppointment.status,
      note: updatedAppointment.note,
      message: 'Appointment updated successfully',
      updatedAt: updatedAppointment.updatedAt,
    };
  }
}
