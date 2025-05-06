import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPatientAppointmentCommand } from './cancel_patient_appointment.command';
import { CancelPatientAppointmentResponse } from './cancel_patient_appointment.response';
import { IAppointmentRepository } from 'src/domain/appointment/interfaces/appointment.repository.interface';
import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';
import { PatientNotFoundException } from 'src/domain/patient/exceptions/patient.exceptions';

@Injectable()
@CommandHandler(CancelPatientAppointmentCommand)
export class CancelPatientAppointmentHandler
  implements ICommandHandler<CancelPatientAppointmentCommand>
{
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    command: CancelPatientAppointmentCommand,
  ): Promise<CancelPatientAppointmentResponse> {
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
        'You do not have permission to cancel this appointment',
      );
    }

    // Check if appointment can be cancelled (not already completed or cancelled)
    const nonCancellableStatuses = [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NO_SHOW,
    ];

    if (nonCancellableStatuses.includes(appointment.status)) {
      throw new ForbiddenException(
        `Cannot cancel appointment with status ${appointment.status}`,
      );
    }

    // Update appointment status to CANCELLED
    const updatedAppointment = await this.appointmentRepository.update(
      command.appointmentId,
      command.clinicId,
      {
        status: AppointmentStatus.CANCELLED,
        note: command.cancelReason
          ? `${appointment.note || ''}\nCancellation reason: ${command.cancelReason}`.trim()
          : appointment.note,
        updatedAt: new Date(),
      },
    );

    // Return response
    return {
      appointmentId: updatedAppointment.id,
      clinicId: updatedAppointment.clinicId,
      patientId: updatedAppointment.patientId,
      status: updatedAppointment.status,
      message: 'Appointment cancelled successfully',
      cancelledAt: updatedAppointment.updatedAt,
    };
  }
}
