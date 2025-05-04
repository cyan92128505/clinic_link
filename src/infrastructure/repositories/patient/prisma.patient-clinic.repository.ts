import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient-clinic.repository.interface';
import { PatientClinic } from 'src/domain/patient/entities/patient-clinic.entity';

@Injectable()
export class PrismaPatientClinicRepository implements IPatientClinicRepository {
  private readonly logger = new Logger(PrismaPatientClinicRepository.name);

  constructor(private prisma: PrismaService) {}

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

      return this.mapToDomainEntity(relation);
    } catch (error) {
      this.logger.error(
        `Error finding patient-clinic relation: ${error.message}`,
        error.stack,
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

      return relations.map((relation) => this.mapToDomainEntity(relation));
    } catch (error) {
      this.logger.error(
        `Error finding clinics for patient: ${error.message}`,
        error.stack,
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

      return relations.map((relation) => this.mapToDomainEntity(relation));
    } catch (error) {
      this.logger.error(
        `Error finding patients for clinic: ${error.message}`,
        error.stack,
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

      return relations.map((relation) => this.mapToDomainEntity(relation));
    } catch (error) {
      this.logger.error(
        `Error finding active patients for clinic: ${error.message}`,
        error.stack,
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

      return this.mapToDomainEntity(relation);
    } catch (error) {
      this.logger.error(
        `Error finding patient by number in clinic: ${error.message}`,
        error.stack,
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
          medicalHistory: patientClinic.medicalHistory as any,
          note: patientClinic.note,
          firstVisitDate: patientClinic.firstVisitDate,
          lastVisitDate: patientClinic.lastVisitDate,
          isActive: patientClinic.isActive,
          createdAt: patientClinic.createdAt,
          updatedAt: patientClinic.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdRelation);
    } catch (error) {
      this.logger.error(
        `Error creating patient-clinic relation: ${error.message}`,
        error.stack,
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
      const updateData: any = { ...data };

      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      updateData.updatedAt = new Date();

      const updatedRelation = await this.prisma.patientClinic.update({
        where: {
          patientId_clinicId: {
            patientId,
            clinicId,
          },
        },
        data: updateData,
      });

      return this.mapToDomainEntity(updatedRelation);
    } catch (error) {
      this.logger.error(
        `Error updating patient-clinic relation: ${error.message}`,
        error.stack,
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
    } catch (error) {
      this.logger.error(
        `Error deleting patient-clinic relation: ${error.message}`,
        error.stack,
      );

      // If the error is because the relation doesn't exist, return false
      if (error.code === 'P2025') {
        return false;
      }

      throw error;
    }
  }

  /**
   * Helper method to map Prisma model to domain entity
   */
  private mapToDomainEntity(prismaRelation: any): PatientClinic {
    return new PatientClinic({
      patientId: prismaRelation.patientId,
      clinicId: prismaRelation.clinicId,
      patientNumber: prismaRelation.patientNumber,
      medicalHistory: prismaRelation.medicalHistory,
      note: prismaRelation.note,
      firstVisitDate: new Date(prismaRelation.firstVisitDate),
      lastVisitDate: new Date(prismaRelation.lastVisitDate),
      isActive: prismaRelation.isActive,
      createdAt: new Date(prismaRelation.createdAt),
      updatedAt: new Date(prismaRelation.updatedAt),
    });
  }
}
