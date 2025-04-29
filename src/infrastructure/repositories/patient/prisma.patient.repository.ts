import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IPatientRepository } from '../../../domain/patient/interfaces/patient.repository.interface';
import { Patient } from '../../../domain/patient/entities/patient.entity';
import { Gender } from '../../../domain/patient/value_objects/gender.enum';

@Injectable()
export class PrismaPatientRepository implements IPatientRepository {
  private readonly logger = new Logger(PrismaPatientRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find all patients in a clinic with optional filters
   */
  async findAll(
    clinicId: string,
    filters?: Partial<Patient>,
  ): Promise<Patient[]> {
    try {
      // Build the where condition
      const where: any = { clinicId };

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
   * Find patient by ID
   */
  async findById(id: string, clinicId: string): Promise<Patient | null> {
    try {
      const patient = await this.prisma.patient.findFirst({
        where: {
          id,
          clinicId,
        },
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
   * Create a new patient
   */
  async create(patient: Patient): Promise<Patient> {
    try {
      const createdPatient = await this.prisma.patient.create({
        data: {
          id: patient.id,
          clinicId: patient.clinicId,
          nationalId: patient.nationalId,
          name: patient.name,
          birthDate: patient.birthDate,
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          emergencyContact: patient.emergencyContact,
          emergencyPhone: patient.emergencyPhone,
          medicalHistory: patient.medicalHistory as any,
          note: patient.note,
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
  async update(
    id: string,
    clinicId: string,
    data: Partial<Patient>,
  ): Promise<Patient> {
    try {
      // Cast medicalHistory to any for prisma JSON field if present
      const updateData: any = { ...data };

      const updatedPatient = await this.prisma.patient.update({
        where: {
          id,
          clinicId,
        },
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
  async delete(id: string, clinicId: string): Promise<boolean> {
    try {
      const deletedPatient = await this.prisma.patient.delete({
        where: {
          id,
          clinicId,
        },
      });

      return deletedPatient != null;
    } catch (error) {
      this.logger.error(
        `Error deleting patient: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Find patient by national ID
   */
  async findByNationalId(
    clinicId: string,
    nationalId: string,
  ): Promise<Patient | null> {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: {
          clinicId_nationalId: {
            clinicId,
            nationalId,
          },
        },
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
  async findByPhone(clinicId: string, phone: string): Promise<Patient[]> {
    try {
      const patients = await this.prisma.patient.findMany({
        where: {
          clinicId,
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
   * Search patients by name, phone, or national ID
   */
  async search(clinicId: string, query: string): Promise<Patient[]> {
    try {
      const patients = await this.prisma.patient.findMany({
        where: {
          clinicId,
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

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaPatient: any): Patient {
    return new Patient({
      id: prismaPatient.id,
      clinicId: prismaPatient.clinicId,
      nationalId: prismaPatient.nationalId,
      name: prismaPatient.name,
      birthDate: prismaPatient.birthDate,
      gender: prismaPatient.gender as Gender,
      phone: prismaPatient.phone,
      email: prismaPatient.email,
      address: prismaPatient.address,
      emergencyContact: prismaPatient.emergencyContact,
      emergencyPhone: prismaPatient.emergencyPhone,
      medicalHistory: prismaPatient.medicalHistory,
      note: prismaPatient.note,
      createdAt: prismaPatient.createdAt,
      updatedAt: prismaPatient.updatedAt,
    });
  }
}
