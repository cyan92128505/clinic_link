import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';
import { Clinic, Prisma } from '@prisma/client';
import { Patient } from 'src/domain/patient/entities/patient.entity';

// 定義 Prisma PatientClinic 模型的型別
interface PrismaPatientClinic {
  patientId: string;
  clinicId: string;
  patientNumber: string | null;
  medicalHistory: Record<string, any>; // 或更具體的 JSON 型別
  note: string | null;
  firstVisitDate: Date;
  lastVisitDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  clinic?: Clinic; // 若需要 include clinic 時使用
  patient?: Patient; // 若需要 include patient 時使用
}

@Injectable()
export class PrismaPatientClinicRepository implements IPatientClinicRepository {
  private readonly logger = new Logger(PrismaPatientClinicRepository.name);

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
   * Find patient-clinic relation by patient and clinic IDs
   */
  async findByPatientAndClinic(
    patientId: string,
    clinicId: string,
  ): Promise<PatientClinic | null> {
    try {
      const relation = await this.prisma.patientClinic.findUnique({
        where: {
          patientId_clinicId: {
            patientId,
            clinicId,
          },
        },
      });

      if (!relation) {
        return null;
      }

      return this.mapToDomainEntity(relation as PrismaPatientClinic);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding patient-clinic relation: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find all clinics for a patient
   */
  async findByPatient(patientId: string): Promise<PatientClinic[]> {
    try {
      const relations = await this.prisma.patientClinic.findMany({
        where: { patientId },
        include: {
          clinic: true,
        },
        orderBy: [{ lastVisitDate: 'desc' }],
      });

      return relations.map((relation) =>
        this.mapToDomainEntity(relation as PrismaPatientClinic),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding clinics for patient: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find all patients for a clinic
   */
  async findByClinic(clinicId: string): Promise<PatientClinic[]> {
    try {
      const relations = await this.prisma.patientClinic.findMany({
        where: { clinicId },
        include: {
          patient: true,
        },
        orderBy: [{ lastVisitDate: 'desc' }],
      });

      return relations.map((relation) =>
        this.mapToDomainEntity(relation as PrismaPatientClinic),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding patients for clinic: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find active patients for a clinic
   */
  async findActivePatientsByClinic(clinicId: string): Promise<PatientClinic[]> {
    try {
      const relations = await this.prisma.patientClinic.findMany({
        where: {
          clinicId,
          isActive: true,
        },
        include: {
          patient: true,
        },
        orderBy: [{ lastVisitDate: 'desc' }],
      });

      return relations.map((relation) =>
        this.mapToDomainEntity(relation as PrismaPatientClinic),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding active patients for clinic: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find by patient number in clinic
   */
  async findByPatientNumberInClinic(
    clinicId: string,
    patientNumber: string,
  ): Promise<PatientClinic | null> {
    try {
      const relation = await this.prisma.patientClinic.findUnique({
        where: {
          clinicId_patientNumber: {
            clinicId,
            patientNumber,
          },
        },
      });

      if (!relation) {
        return null;
      }

      return this.mapToDomainEntity(relation as PrismaPatientClinic);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding patient by number in clinic: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Create a new patient-clinic relation
   */
  async create(patientClinic: PatientClinic): Promise<PatientClinic> {
    try {
      const createdRelation = await this.prisma.patientClinic.create({
        data: {
          patientId: patientClinic.patientId,
          clinicId: patientClinic.clinicId,
          patientNumber: patientClinic.patientNumber,
          medicalHistory: patientClinic.medicalHistory,
          note: patientClinic.note,
          firstVisitDate: patientClinic.firstVisitDate,
          lastVisitDate: patientClinic.lastVisitDate,
          isActive: patientClinic.isActive,
          createdAt: patientClinic.createdAt,
          updatedAt: patientClinic.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdRelation as PrismaPatientClinic);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error creating patient-clinic relation: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Update a patient-clinic relation
   */
  async update(
    patientId: string,
    clinicId: string,
    data: Partial<PatientClinic>,
  ): Promise<PatientClinic> {
    try {
      // 使用型別安全的方式處理更新資料
      const updateData: Record<string, unknown> = {};

      // 複製非 undefined 欄位
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof Partial<PatientClinic>];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      // 若有 medicalHistory 欄位，安全地處理 JSON 型別
      if ('medicalHistory' in data && data.medicalHistory !== undefined) {
        updateData.medicalHistory = data.medicalHistory as Prisma.JsonValue;
      }

      updateData.updatedAt = new Date();

      const updatedRelation = await this.prisma.patientClinic.update({
        where: {
          patientId_clinicId: {
            patientId,
            clinicId,
          },
        },
        data: updateData as Prisma.PatientClinicUpdateInput,
      });

      return this.mapToDomainEntity(updatedRelation as PrismaPatientClinic);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error updating patient-clinic relation: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Delete a patient-clinic relation
   */
  async delete(patientId: string, clinicId: string): Promise<boolean> {
    try {
      await this.prisma.patientClinic.delete({
        where: {
          patientId_clinicId: {
            patientId,
            clinicId,
          },
        },
      });

      return true;
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error deleting patient-clinic relation: ${errorMessage}`,
        errorStack,
      );

      // 如果錯誤是因為關聯不存在，則返回 false
      if (this.isPrismaError(error) && error.code === 'P2025') {
        return false;
      }

      throw error;
    }
  }

  /**
   * Helper method to map Prisma model to domain entity
   */
  private mapToDomainEntity(
    prismaRelation: PrismaPatientClinic,
  ): PatientClinic {
    return new PatientClinic({
      patientId: prismaRelation.patientId,
      clinicId: prismaRelation.clinicId,
      patientNumber: prismaRelation.patientNumber || undefined,
      medicalHistory: prismaRelation.medicalHistory,
      note: prismaRelation.note || undefined,
      firstVisitDate: new Date(prismaRelation.firstVisitDate),
      lastVisitDate: new Date(prismaRelation.lastVisitDate),
      isActive: prismaRelation.isActive,
      createdAt: new Date(prismaRelation.createdAt),
      updatedAt: new Date(prismaRelation.updatedAt),
    });
  }
}
