import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { Patient } from 'src/domain/patient/entities/patient.entity';
import { Gender } from 'src/domain/patient/value_objects/gender.enum';

@Injectable()
export class PrismaPatientRepository implements IPatientRepository {
  private readonly logger = new Logger(PrismaPatientRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find all patients with optional filters (no clinicId)
   */
  async findAll(filters?: Partial<Patient>): Promise<Patient[]> {
    try {
      // Build the where condition
      const where: any = {};

      // Add filters if provided
      if (filters) {
        if (filters.gender) {
          where.gender = filters.gender;
        }
        if (filters.name) {
          where.name = {
            contains: filters.name,
            mode: 'insensitive',
          };
        }
        if (filters.nationalId) {
          where.nationalId = filters.nationalId;
        }
        if (filters.phone) {
          where.phone = {
            contains: filters.phone,
          };
        }
        if (filters.email) {
          where.email = {
            contains: filters.email,
            mode: 'insensitive',
          };
        }
      }

      const patients = await this.prisma.patient.findMany({
        where,
        orderBy: [{ name: 'asc' }],
      });

      return patients.map((patient) => this.mapToDomainEntity(patient));
    } catch (error) {
      this.logger.error(
        `Error finding all patients: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find patient by ID (no clinicId)
   */
  async findById(id: string): Promise<Patient | null> {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
      });

      if (!patient) {
        return null;
      }

      return this.mapToDomainEntity(patient);
    } catch (error) {
      this.logger.error(
        `Error finding patient by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find patient by Firebase UID
   */
  async findByFirebaseUid(firebaseUid: string): Promise<Patient | null> {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { firebaseUid },
      });

      if (!patient) {
        return null;
      }

      return this.mapToDomainEntity(patient);
    } catch (error) {
      this.logger.error(
        `Error finding patient by Firebase UID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find patient by national ID (globally unique)
   */
  async findByNationalId(nationalId: string): Promise<Patient | null> {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { nationalId },
      });

      if (!patient) {
        return null;
      }

      return this.mapToDomainEntity(patient);
    } catch (error) {
      this.logger.error(
        `Error finding patient by national ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find patients by phone number
   */
  async findByPhone(phone: string): Promise<Patient[]> {
    try {
      const patients = await this.prisma.patient.findMany({
        where: {
          phone: {
            contains: phone,
          },
        },
        orderBy: [{ name: 'asc' }],
      });

      return patients.map((patient) => this.mapToDomainEntity(patient));
    } catch (error) {
      this.logger.error(
        `Error finding patients by phone: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Search patients by name, phone, national ID, or email
   */
  async search(query: string): Promise<Patient[]> {
    try {
      const patients = await this.prisma.patient.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              phone: {
                contains: query,
              },
            },
            {
              nationalId: {
                contains: query,
              },
            },
            {
              email: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [{ name: 'asc' }],
        take: 50, // Limit results for performance
      });

      return patients.map((patient) => this.mapToDomainEntity(patient));
    } catch (error) {
      this.logger.error(
        `Error searching patients: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a new patient
   */
  async create(patient: Patient): Promise<Patient> {
    try {
      const createdPatient = await this.prisma.patient.create({
        data: {
          id: patient.id,
          firebaseUid: patient.firebaseUid,
          nationalId: patient.nationalId,
          name: patient.name,
          birthDate: patient.birthDate,
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          emergencyContact: patient.emergencyContact,
          emergencyPhone: patient.emergencyPhone,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdPatient);
    } catch (error) {
      this.logger.error(
        `Error creating patient: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update an existing patient
   */
  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    try {
      const updateData: any = { ...data };

      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      updateData.updatedAt = new Date();

      const updatedPatient = await this.prisma.patient.update({
        where: { id },
        data: updateData,
      });

      return this.mapToDomainEntity(updatedPatient);
    } catch (error) {
      this.logger.error(
        `Error updating patient: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a patient
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.patient.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting patient: ${error.message}`,
        error.stack,
      );

      // If the error is because the patient doesn't exist, return false
      if (error.code === 'P2025') {
        return false;
      }

      throw error;
    }
  }

  /**
   * Helper method to map Prisma model to domain entity
   */
  private mapToDomainEntity(prismaPatient: any): Patient {
    return new Patient({
      id: prismaPatient.id,
      firebaseUid: prismaPatient.firebaseUid,
      nationalId: prismaPatient.nationalId,
      name: prismaPatient.name,
      birthDate: prismaPatient.birthDate
        ? new Date(prismaPatient.birthDate)
        : undefined,
      gender: prismaPatient.gender as Gender,
      phone: prismaPatient.phone,
      email: prismaPatient.email,
      address: prismaPatient.address,
      emergencyContact: prismaPatient.emergencyContact,
      emergencyPhone: prismaPatient.emergencyPhone,
      createdAt: new Date(prismaPatient.createdAt),
      updatedAt: new Date(prismaPatient.updatedAt),
    });
  }
}
