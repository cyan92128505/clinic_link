import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { Patient } from 'src/domain/patient/entities/patient.entity';
import { Gender } from 'src/domain/patient/value_objects/gender.enum';
import { Prisma } from '@prisma/client';

// 定義 Prisma Patient 模型的型別
interface PrismaPatient {
  id: string;
  firebaseUid: string | null;
  nationalId: string | null;
  name: string;
  birthDate: Date | null;
  gender: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaPatientRepository implements IPatientRepository {
  private readonly logger = new Logger(PrismaPatientRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Helper method to check if an error is an Error object
   */
  private isError(error: unknown): error is Error {
    return error instanceof Error;
  }

  /**
   * Helper method to check if an error is a Prisma error
   */
  private isPrismaError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      this.isError(error) && 'code' in error && typeof error.code === 'string'
    );
  }

  /**
   * Find all patients with optional filters (no clinicId)
   */
  async findAll(filters?: Partial<Patient>): Promise<Patient[]> {
    try {
      // Build the where condition
      const where: Prisma.PatientWhereInput = {};

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

      return patients.map((patient) =>
        this.mapToDomainEntity(patient as PrismaPatient),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding all patients: ${errorMessage}`,
        errorStack,
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

      return this.mapToDomainEntity(patient as PrismaPatient);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding patient by ID: ${errorMessage}`,
        errorStack,
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

      return this.mapToDomainEntity(patient as PrismaPatient);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding patient by Firebase UID: ${errorMessage}`,
        errorStack,
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

      return this.mapToDomainEntity(patient as PrismaPatient);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding patient by national ID: ${errorMessage}`,
        errorStack,
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

      return patients.map((patient) =>
        this.mapToDomainEntity(patient as PrismaPatient),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding patients by phone: ${errorMessage}`,
        errorStack,
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

      return patients.map((patient) =>
        this.mapToDomainEntity(patient as PrismaPatient),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error searching patients: ${errorMessage}`,
        errorStack,
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

      return this.mapToDomainEntity(createdPatient as PrismaPatient);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error creating patient: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Update an existing patient
   */
  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    try {
      // 使用型別安全的方式處理更新資料
      const updateData: Record<string, unknown> = {};

      // 複製非 undefined 欄位
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof Partial<Patient>];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      updateData.updatedAt = new Date();

      const updatedPatient = await this.prisma.patient.update({
        where: { id },
        data: updateData as Prisma.PatientUpdateInput,
      });

      return this.mapToDomainEntity(updatedPatient as PrismaPatient);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error updating patient: ${errorMessage}`, errorStack);
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
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error deleting patient: ${errorMessage}`, errorStack);

      // 如果錯誤是因為病患不存在，則返回 false
      if (this.isPrismaError(error) && error.code === 'P2025') {
        return false;
      }

      throw error;
    }
  }

  /**
   * Helper method to map Prisma model to domain entity
   */
  private mapToDomainEntity(prismaPatient: PrismaPatient): Patient {
    return new Patient({
      id: prismaPatient.id,
      firebaseUid: prismaPatient.firebaseUid || undefined,
      nationalId: prismaPatient.nationalId || undefined,
      name: prismaPatient.name,
      birthDate: prismaPatient.birthDate
        ? new Date(prismaPatient.birthDate)
        : undefined,
      gender: prismaPatient.gender as Gender | undefined,
      phone: prismaPatient.phone,
      email: prismaPatient.email || undefined,
      address: prismaPatient.address || undefined,
      emergencyContact: prismaPatient.emergencyContact || undefined,
      emergencyPhone: prismaPatient.emergencyPhone || undefined,
      createdAt: new Date(prismaPatient.createdAt),
      updatedAt: new Date(prismaPatient.updatedAt),
    });
  }
}
