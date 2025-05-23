import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IDoctorRepository } from '../../../domain/doctor/interfaces/doctor.repository.interface';
import { Doctor } from '../../../domain/doctor/entities/doctor.entity';
import { Prisma } from '@prisma/client';

// 定義 Prisma Doctor 模型的型別
interface PrismaDoctor {
  id: string;
  clinicId: string;
  departmentId: string;
  userId: string | null;
  name: string;
  title: string | null;
  specialty: string | null;
  licenseNumber: string | null;
  bio: string | null;
  avatar: string | null;
  scheduleData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaDoctorRepository implements IDoctorRepository {
  private readonly logger = new Logger(PrismaDoctorRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Helper method to check if an error is an Error object
   */
  private isError(error: unknown): error is Error {
    return error instanceof Error;
  }

  /**
   * Find all doctors in a clinic
   */
  async findAll(clinicId: string): Promise<Doctor[]> {
    try {
      const doctors = await this.prisma.doctor.findMany({
        where: {
          clinicId,
        },
        orderBy: [{ name: 'asc' }],
      });

      return doctors.map((doctor) =>
        this.mapToDomainEntity(doctor as PrismaDoctor),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding all doctors: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find doctor by ID
   */
  async findById(id: string, clinicId: string): Promise<Doctor | null> {
    try {
      const doctor = await this.prisma.doctor.findFirst({
        where: {
          id,
          clinicId,
        },
      });

      if (!doctor) {
        return null;
      }

      return this.mapToDomainEntity(doctor as PrismaDoctor);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding doctor by ID: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Create a new doctor
   */
  async create(doctor: Doctor): Promise<Doctor> {
    try {
      const createdDoctor = await this.prisma.doctor.create({
        data: {
          id: doctor.id,
          clinicId: doctor.clinicId,
          departmentId: doctor.departmentId,
          userId: doctor.userId,
          name: doctor.name,
          title: doctor.title,
          specialty: doctor.specialty,
          licenseNumber: doctor.licenseNumber,
          bio: doctor.bio,
          avatar: doctor.avatar,
          scheduleData: doctor.scheduleData,
          createdAt: doctor.createdAt,
          updatedAt: doctor.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdDoctor as PrismaDoctor);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error creating doctor: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Update an existing doctor
   */
  async update(
    id: string,
    clinicId: string,
    data: Partial<Doctor>,
  ): Promise<Doctor> {
    try {
      // 安全地處理 scheduleData 型別
      const updateData: Record<string, unknown> = { ...data };

      if (data.scheduleData) {
        updateData.scheduleData = data.scheduleData as Prisma.JsonValue;
      }

      const updatedDoctor = await this.prisma.doctor.update({
        where: {
          id,
          clinicId,
        },
        data: updateData as Prisma.DoctorUpdateInput,
      });

      return this.mapToDomainEntity(updatedDoctor as PrismaDoctor);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error updating doctor: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Delete a doctor
   */
  async delete(id: string, clinicId: string): Promise<boolean> {
    try {
      const deletedDoctor = await this.prisma.doctor.delete({
        where: {
          id,
          clinicId,
        },
      });

      return deletedDoctor != null;
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error deleting doctor: ${errorMessage}`, errorStack);
      return false;
    }
  }

  /**
   * Find doctors by department
   */
  async findByDepartment(
    clinicId: string,
    departmentId: string,
  ): Promise<Doctor[]> {
    try {
      const doctors = await this.prisma.doctor.findMany({
        where: {
          clinicId,
          departmentId,
        },
        orderBy: [{ name: 'asc' }],
      });

      return doctors.map((doctor) =>
        this.mapToDomainEntity(doctor as PrismaDoctor),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding doctors by department: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find doctor by user ID
   */
  async findByUser(clinicId: string, userId: string): Promise<Doctor | null> {
    try {
      const doctor = await this.prisma.doctor.findFirst({
        where: {
          clinicId,
          userId,
        },
      });

      if (!doctor) {
        return null;
      }

      return this.mapToDomainEntity(doctor as PrismaDoctor);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding doctor by user ID: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Assign doctor to a room
   */
  async assignRoom(doctorId: string, roomId: string): Promise<boolean> {
    try {
      // Check if the association already exists
      const existingAssignment = await this.prisma.doctorRoom.findUnique({
        where: {
          doctorId_roomId: {
            doctorId,
            roomId,
          },
        },
      });

      // If already exists, return true
      if (existingAssignment) {
        return true;
      }

      // Create new association
      await this.prisma.doctorRoom.create({
        data: {
          doctorId,
          roomId,
          createdAt: new Date(),
        },
      });

      return true;
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error assigning doctor to room: ${errorMessage}`,
        errorStack,
      );
      return false;
    }
  }

  /**
   * Remove doctor from a room
   */
  async removeRoom(doctorId: string, roomId: string): Promise<boolean> {
    try {
      await this.prisma.doctorRoom.delete({
        where: {
          doctorId_roomId: {
            doctorId,
            roomId,
          },
        },
      });

      return true;
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error removing doctor from room: ${errorMessage}`,
        errorStack,
      );
      return false;
    }
  }

  /**
   * Find doctors by room
   */
  async findByRoom(clinicId: string, roomId: string): Promise<Doctor[]> {
    try {
      // First get the doctorIds associated with the room
      const doctorRooms = await this.prisma.doctorRoom.findMany({
        where: {
          roomId,
        },
        select: {
          doctorId: true,
        },
      });

      // Extract doctorIds from the doctor-room relationships
      const doctorIds = doctorRooms.map((dr) => dr.doctorId);

      // Then fetch the actual doctors that belong to the specified clinic
      const doctors = await this.prisma.doctor.findMany({
        where: {
          id: {
            in: doctorIds,
          },
          clinicId,
        },
      });

      return doctors.map((doctor) =>
        this.mapToDomainEntity(doctor as PrismaDoctor),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding doctors by room: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity with type safety
  private mapToDomainEntity(prismaDoctor: PrismaDoctor): Doctor {
    return new Doctor({
      id: prismaDoctor.id,
      clinicId: prismaDoctor.clinicId,
      departmentId: prismaDoctor.departmentId,
      userId: prismaDoctor.userId || undefined,
      name: prismaDoctor.name,
      title: prismaDoctor.title || undefined,
      specialty: prismaDoctor.specialty || undefined,
      licenseNumber: prismaDoctor.licenseNumber || undefined,
      bio: prismaDoctor.bio || undefined,
      avatar: prismaDoctor.avatar || undefined,
      scheduleData: prismaDoctor.scheduleData,
      createdAt: prismaDoctor.createdAt,
      updatedAt: prismaDoctor.updatedAt,
    });
  }
}
