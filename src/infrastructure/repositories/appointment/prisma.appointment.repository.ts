import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IAppointmentRepository } from '../../../domain/appointment/interfaces/appointment.repository.interface';
import { Appointment } from '../../../domain/appointment/entities/appointment.entity';
import { AppointmentStatus } from '../../../domain/appointment/value_objects/appointment.enum';

@Injectable()
export class PrismaAppointmentRepository implements IAppointmentRepository {
  private readonly logger = new Logger(PrismaAppointmentRepository.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    clinicId: string,
    date: string | undefined,
    status: AppointmentStatus | undefined,
  ): Promise<Appointment[]> {
    // Build the where condition
    const where: any = { clinicId };

    // Add date filter if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.appointmentTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    try {
      const appointments = await this.prisma.appointment.findMany({
        where,
        orderBy: [{ appointmentTime: 'asc' }, { createdAt: 'asc' }],
      });

      // Map Prisma model to domain entity
      return appointments.map((appointment) =>
        this.mapToDomainEntity(appointment),
      );
    } catch (error) {
      this.logger.error(
        `Error finding appointments: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string, clinicId: string): Promise<Appointment | null> {
    try {
      const appointment = await this.prisma.appointment.findFirst({
        where: {
          id,
          clinicId,
        },
      });

      if (!appointment) {
        return null;
      }

      return this.mapToDomainEntity(appointment);
    } catch (error) {
      this.logger.error(
        `Error finding appointment by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(appointment: Appointment): Promise<Appointment> {
    try {
      const createdAppointment = await this.prisma.appointment.create({
        data: {
          id: appointment.id,
          clinicId: appointment.clinicId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          roomId: appointment.roomId,
          appointmentNumber: appointment.appointmentNumber,
          appointmentTime: appointment.appointmentTime,
          checkinTime: appointment.checkinTime,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          source: appointment.source,
          note: appointment.note,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdAppointment);
    } catch (error) {
      this.logger.error(
        `Error creating appointment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<Appointment>,
    clinicId: string,
  ): Promise<Appointment> {
    try {
      const updatedAppointment = await this.prisma.appointment.update({
        where: {
          id: id,
          clinicId: clinicId,
        },
        data,
      });

      return this.mapToDomainEntity(updatedAppointment);
    } catch (error) {
      this.logger.error(
        `Error updating appointment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async delete(id: string, clinicId: string): Promise<boolean> {
    try {
      const deletedAppointment = await this.prisma.appointment.delete({
        where: {
          id: id,
          clinicId: clinicId,
        },
      });

      return deletedAppointment != null;
    } catch (error) {
      this.logger.error(
        `Error updating appointment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaAppointment: any): Appointment {
    return new Appointment({
      id: prismaAppointment.id,
      clinicId: prismaAppointment.clinicId,
      patientId: prismaAppointment.patientId,
      doctorId: prismaAppointment.doctorId,
      roomId: prismaAppointment.roomId,
      appointmentNumber: prismaAppointment.appointmentNumber,
      appointmentTime: prismaAppointment.appointmentTime,
      checkinTime: prismaAppointment.checkinTime,
      startTime: prismaAppointment.startTime,
      endTime: prismaAppointment.endTime,
      status: prismaAppointment.status as AppointmentStatus,
      source: prismaAppointment.source,
      note: prismaAppointment.note,
      createdAt: prismaAppointment.createdAt,
      updatedAt: prismaAppointment.updatedAt,
    });
  }
}
