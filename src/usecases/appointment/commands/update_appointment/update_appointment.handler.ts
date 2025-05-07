import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { IAppointmentRepository } from '../../../../domain/appointment/interfaces/appointment.repository.interface';
import { UpdateAppointmentCommand } from './update_appointment.command';
import { UpdateAppointmentResponse } from './update_appointment.response';
import { AppointmentStatus } from '../../../../domain/appointment/value_objects/appointment.enum';
import { Appointment } from '../../../../domain/appointment/entities/appointment.entity';

// 定義更新資料的介面
interface AppointmentUpdateData {
  status?: AppointmentStatus;
  doctorId?: string | null;
  roomId?: string | null;
  appointmentTime?: Date;
  checkinTime?: Date;
  startTime?: Date;
  endTime?: Date;
  note?: string;
  updatedAt: Date;
}

@Injectable()
export class UpdateAppointmentHandler {
  private readonly logger = new Logger(UpdateAppointmentHandler.name);

  constructor(
    @Inject('IAppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    command: UpdateAppointmentCommand,
  ): Promise<UpdateAppointmentResponse> {
    const { id, clinicId, status, doctorId, roomId, appointmentTime, note } =
      command;

    // Find the appointment
    const appointment = await this.appointmentRepository.findById(id, clinicId);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: AppointmentUpdateData = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      updateData.status = status;

      // Update timestamps based on status transitions
      if (status === AppointmentStatus.CHECKED_IN && !appointment.checkinTime) {
        updateData.checkinTime = new Date();
      } else if (
        status === AppointmentStatus.IN_PROGRESS &&
        !appointment.startTime
      ) {
        updateData.startTime = new Date();
      } else if (
        status === AppointmentStatus.COMPLETED &&
        !appointment.endTime
      ) {
        updateData.endTime = new Date();
      }
    }

    if (doctorId !== undefined) {
      updateData.doctorId = doctorId;
    }

    if (roomId !== undefined) {
      updateData.roomId = roomId;
    }

    if (appointmentTime !== undefined) {
      updateData.appointmentTime = new Date(appointmentTime);
    }

    if (note !== undefined) {
      updateData.note = note;
    }

    // Update the appointment
    try {
      const updatedAppointment = await this.appointmentRepository.update(
        id,
        clinicId,
        updateData as Partial<Appointment>,
      );
      return new UpdateAppointmentResponse(updatedAppointment);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to update appointment: ${errorMessage}`,
        errorStack,
      );
      throw new Error('Failed to update appointment');
    }
  }
}
