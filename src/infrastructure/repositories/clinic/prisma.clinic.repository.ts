import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IClinicRepository } from '../../../domain/clinic/interfaces/clinic.repository.interface';
import { Clinic } from '../../../domain/clinic/entities/clinic.entity';

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
      this.logger.error(
        `Error finding all clinics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
      this.logger.error(
        `Error finding clinic by ID: ${error.message}`,
        error.stack,
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
          settings: clinic.settings as any,
          createdAt: clinic.createdAt,
          updatedAt: clinic.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdClinic);
    } catch (error) {
      this.logger.error(`Error creating clinic: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing clinic
   */
  async update(id: string, data: Partial<Clinic>): Promise<Clinic> {
    try {
      // Cast settings to any for prisma JSON field
      const updateData: any = { ...data };

      const updatedClinic = await this.prisma.clinic.update({
        where: {
          id: id,
        },
        data: updateData,
      });

      return this.mapToDomainEntity(updatedClinic);
    } catch (error) {
      this.logger.error(`Error updating clinic: ${error.message}`, error.stack);
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
      this.logger.error(`Error deleting clinic: ${error.message}`, error.stack);
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
      this.logger.error(
        `Error finding clinics by user ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaClinic: any): Clinic {
    return new Clinic({
      id: prismaClinic.id,
      name: prismaClinic.name,
      address: prismaClinic.address,
      phone: prismaClinic.phone,
      email: prismaClinic.email,
      logo: prismaClinic.logo,
      settings: prismaClinic.settings,
      createdAt: prismaClinic.createdAt,
      updatedAt: prismaClinic.updatedAt,
    });
  }
}
