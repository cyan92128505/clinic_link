import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IClinicRepository } from '../../../domain/clinic/interfaces/clinic.repository.interface';
import { Clinic } from '../../../domain/clinic/entities/clinic.entity';

interface PrismaClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  logo: string | null;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaClinicRepository implements IClinicRepository {
  private readonly logger = new Logger(PrismaClinicRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find all clinics
   */
  async findAll(): Promise<Clinic[]> {
    try {
      const clinics = await this.prisma.clinic.findMany({
        orderBy: [{ name: 'asc' }],
      });

      // Map Prisma model to domain entity
      return clinics.map((clinic) => this.mapToDomainEntity(clinic));
    } catch (error) {
      const { errorMessage, errorStack } = this.processError(error);
      this.logger.error(
        `Error finding all clinics: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }

    return [];
  }

  /**
   * Find clinic by ID
   */
  async findById(id: string): Promise<Clinic | null> {
    try {
      const clinic = await this.prisma.clinic.findUnique({
        where: {
          id,
        },
      });

      if (!clinic) {
        return null;
      }

      return this.mapToDomainEntity(clinic);
    } catch (error) {
      const { errorMessage, errorStack } = this.processError(error);

      this.logger.error(
        `Error finding clinic by ID: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Create a new clinic
   */
  async create(clinic: Clinic): Promise<Clinic> {
    try {
      const createdClinic = await this.prisma.clinic.create({
        data: {
          id: clinic.id,
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          email: clinic.email,
          logo: clinic.logo,
          settings: clinic.settings,
          createdAt: clinic.createdAt,
          updatedAt: clinic.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdClinic);
    } catch (error) {
      const { errorMessage, errorStack } = this.processError(error);

      this.logger.error(`Error creating clinic: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Update an existing clinic
   */
  async update(id: string, data: Partial<Clinic>): Promise<Clinic> {
    try {
      // Cast settings to any for prisma JSON field
      const updateData = { ...data };

      const updatedClinic = await this.prisma.clinic.update({
        where: {
          id: id,
        },
        data: updateData,
      });

      return this.mapToDomainEntity(updatedClinic);
    } catch (error) {
      const { errorMessage, errorStack } = this.processError(error);

      this.logger.error(`Error updating clinic: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Delete a clinic
   */
  async delete(id: string): Promise<boolean> {
    try {
      const deletedClinic = await this.prisma.clinic.delete({
        where: {
          id: id,
        },
      });

      return deletedClinic != null;
    } catch (error) {
      const { errorMessage, errorStack } = this.processError(error);

      this.logger.error(`Error deleting clinic: ${errorMessage}`, errorStack);
      return false;
    }
  }

  /**
   * Find clinics by user ID
   */
  async findByUser(userId: string): Promise<Clinic[]> {
    try {
      // Query user-clinic relationships first
      const userClinics = await this.prisma.userClinic.findMany({
        where: {
          userId: userId,
        },
        include: {
          clinic: true,
        },
      });

      // Extract and map clinics from the relationships
      return userClinics.map((userClinic) =>
        this.mapToDomainEntity(userClinic.clinic),
      );
    } catch (error) {
      const { errorMessage, errorStack } = this.processError(error);

      this.logger.error(
        `Error finding clinics by user ID: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaClinic: PrismaClinic): Clinic {
    return new Clinic({
      id: prismaClinic.id,
      name: prismaClinic.name,
      address: prismaClinic.address,
      phone: prismaClinic.phone,
      email: prismaClinic.email!,
      logo: prismaClinic.logo!,
      settings: prismaClinic.settings as Record<string, any>,
      createdAt: prismaClinic.createdAt,
      updatedAt: prismaClinic.updatedAt,
    });
  }

  private processError(error: unknown): {
    errorMessage: string;
    errorStack: string | undefined;
  } {
    const errorMessage = this.isError(error) ? error.message : '未知錯誤';
    const errorStack = this.isError(error) ? error.stack : undefined;

    this.logger.error(`Error finding all clinics: ${errorMessage}`, errorStack);
    return {
      errorMessage,
      errorStack,
    };
  }

  private isError(error: unknown): error is Error {
    return error instanceof Error;
  }
}
