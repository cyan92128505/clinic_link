import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IAppointmentRepository } from '../../../domain/appointment/interfaces/appointment.repository.interface';
import { Appointment } from '../../../domain/appointment/entities/appointment.entity';
import {
  AppointmentSource,
  AppointmentStatus,
  AppointmentStatusUtils,
} from '../../../domain/appointment/value_objects/appointment.enum';
import { Prisma } from '@prisma/client';

// 定義 Prisma 模型與返回型別
type PrismaAppointment = Prisma.AppointmentGetPayload<object>;

@Injectable()
export class PrismaAppointmentRepository implements IAppointmentRepository {
  private readonly logger = new Logger(PrismaAppointmentRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find all appointments with optional filters
   */
  async findAll(
    clinicId: string,
    filters?: Partial<Appointment>,
  ): Promise<Appointment[]> {
    // Build the where condition with 正確型別
    const where: Prisma.AppointmentWhereInput = { clinicId };

    // Add filters if provided
    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.doctorId) {
        where.doctorId = filters.doctorId;
      }

      if (filters.patientId) {
        where.patientId = filters.patientId;
      }

      if (filters.roomId) {
        where.roomId = filters.roomId;
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding appointments: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error finding appointments: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Find appointment by ID
   */
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding appointment by ID: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error finding appointment by ID: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Create a new appointment
   */
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating appointment: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error creating appointment: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Update an existing appointment
   */
  async update(
    id: string,
    clinicId: string,
    data: Partial<Appointment>,
  ): Promise<Appointment> {
    try {
      const updatedAppointment = await this.prisma.appointment.update({
        where: {
          clinicId: clinicId,
          id: id,
        },
        data: data as unknown as Prisma.AppointmentUpdateInput,
      });

      return this.mapToDomainEntity(updatedAppointment);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating appointment: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error updating appointment: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Delete an appointment
   */
  async delete(id: string, clinicId: string): Promise<boolean> {
    try {
      const deletedAppointment = await this.prisma.appointment.delete({
        where: {
          clinicId: clinicId,
          id: id,
        },
      });

      return deletedAppointment != null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error deleting appointment: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error deleting appointment: Unknown error');
      }
      return false;
    }
  }

  /**
   * Find appointments by status
   */
  async findByStatus(
    clinicId: string,
    statuses: string[],
  ): Promise<Appointment[]> {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          clinicId,
          status: {
            in: statuses
              .map((s) => AppointmentStatusUtils.fromString(s))
              .filter((a): a is AppointmentStatus => a != null),
          },
        },
        orderBy: [{ appointmentTime: 'asc' }, { createdAt: 'asc' }],
      });

      return appointments.map((appointment) =>
        this.mapToDomainEntity(appointment),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding appointments by status: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Error finding appointments by status: Unknown error',
        );
      }
      throw error;
    }
  }

  /**
   * Find appointments by doctor
   */
  async findByDoctor(
    clinicId: string,
    doctorId: string,
  ): Promise<Appointment[]> {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          clinicId,
          doctorId,
        },
        orderBy: [{ appointmentTime: 'asc' }, { createdAt: 'asc' }],
      });

      return appointments.map((appointment) =>
        this.mapToDomainEntity(appointment),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding appointments by doctor: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Error finding appointments by doctor: Unknown error',
        );
      }
      throw error;
    }
  }

  /**
   * Find appointments by patient
   */
  async findByPatient(
    clinicId: string,
    patientId: string,
  ): Promise<Appointment[]> {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          clinicId,
          patientId,
        },
        orderBy: [{ appointmentTime: 'desc' }],
      });

      return appointments.map((appointment) =>
        this.mapToDomainEntity(appointment),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding appointments by patient: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Error finding appointments by patient: Unknown error',
        );
      }
      throw error;
    }
  }

  /**
   * Find appointments by room
   */
  async findByRoom(clinicId: string, roomId: string): Promise<Appointment[]> {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          clinicId,
          roomId,
        },
        orderBy: [{ appointmentTime: 'asc' }, { createdAt: 'asc' }],
      });

      return appointments.map((appointment) =>
        this.mapToDomainEntity(appointment),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding appointments by room: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error finding appointments by room: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Find appointments by date
   */
  async findByDate(clinicId: string, date: Date): Promise<Appointment[]> {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const appointments = await this.prisma.appointment.findMany({
        where: {
          clinicId,
          appointmentTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: [{ appointmentTime: 'asc' }, { createdAt: 'asc' }],
      });

      return appointments.map((appointment) =>
        this.mapToDomainEntity(appointment),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding appointments by date: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error finding appointments by date: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  async updateStatus(
    id: string,
    clinicId: string,
    status: string,
  ): Promise<Appointment> {
    try {
      const appointmentStatus = AppointmentStatusUtils.fromString(status);
      if (!appointmentStatus) {
        throw new Error(`Invalid appointment status: ${status}`);
      }

      const updatedAppointment = await this.prisma.appointment.update({
        where: {
          id: id,
          clinicId: clinicId,
        },
        data: {
          status: appointmentStatus,
          updatedAt: new Date(),
        },
      });

      return this.mapToDomainEntity(updatedAppointment);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating appointment status: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error updating appointment status: Unknown error');
      }
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaAppointment: PrismaAppointment): Appointment {
    return new Appointment({
      id: prismaAppointment.id,
      clinicId: prismaAppointment.clinicId,
      patientId: prismaAppointment.patientId,
      doctorId: prismaAppointment.doctorId || undefined,
      roomId: prismaAppointment.roomId || undefined,
      appointmentNumber: prismaAppointment.appointmentNumber || undefined,
      appointmentTime: prismaAppointment.appointmentTime || undefined,
      checkinTime: prismaAppointment.checkinTime || undefined,
      startTime: prismaAppointment.startTime || undefined,
      endTime: prismaAppointment.endTime || undefined,
      status: prismaAppointment.status as AppointmentStatus,
      source: prismaAppointment.source as AppointmentSource,
      note: prismaAppointment.note || undefined,
      createdAt: prismaAppointment.createdAt,
      updatedAt: prismaAppointment.updatedAt,
    });
  }
}
