import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IAppointmentRepository } from '../../../../domain/appointment/interfaces/appointment.repository.interface';
import { CreateAppointmentCommand } from './create_appointment.command';
import { CreateAppointmentResponse } from './create_appointment.response';
import { Appointment } from '../../../../domain/appointment/entities/appointment.entity';
import { AppointmentStatus } from '../../../../domain/appointment/value_objects/appointment.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@CommandHandler(CreateAppointmentCommand)
export class CreateAppointmentHandler
  implements ICommandHandler<CreateAppointmentCommand>
{
  private readonly logger = new Logger(CreateAppointmentHandler.name);

  constructor(
    @Inject('IAppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    command: CreateAppointmentCommand,
  ): Promise<CreateAppointmentResponse> {
    const { clinicId, patientId, doctorId, appointmentTime, source, note } =
      command;

    if (!patientId) {
      throw new BadRequestException('Patient ID is required');
    }

    // Create new appointment entity
    const newAppointment = new Appointment({
      id: uuidv4(),
      clinicId,
      patientId,
      doctorId,
      appointmentTime: appointmentTime ? new Date(appointmentTime) : undefined,
      status: AppointmentStatus.SCHEDULED,
      source,
      note,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Store the appointment
    try {
      const createdAppointment =
        await this.appointmentRepository.create(newAppointment);
      return new CreateAppointmentResponse(createdAppointment);
    } catch (error) {
      this.logger.error(
        `Failed to create appointment: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to create appointment');
    }
  }
}
