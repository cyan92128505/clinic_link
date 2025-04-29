import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IDepartmentRepository } from '../../../domain/department/interfaces/department.repository.interface';
import { Department } from '../../../domain/department/entities/department.entity';

@Injectable()
export class PrismaDepartmentRepository implements IDepartmentRepository {
  private readonly logger = new Logger(PrismaDepartmentRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find all departments in a clinic
   */
  async findAll(clinicId: string): Promise<Department[]> {
    try {
      const departments = await this.prisma.department.findMany({
        where: {
          clinicId,
        },
        orderBy: [{ name: 'asc' }],
      });

      return departments.map((department) =>
        this.mapToDomainEntity(department),
      );
    } catch (error) {
      this.logger.error(
        `Error finding all departments: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find department by ID
   */
  async findById(id: string, clinicId: string): Promise<Department | null> {
    try {
      const department = await this.prisma.department.findFirst({
        where: {
          id,
          clinicId,
        },
      });

      if (!department) {
        return null;
      }

      return this.mapToDomainEntity(department);
    } catch (error) {
      this.logger.error(
        `Error finding department by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a new department
   */
  async create(department: Department): Promise<Department> {
    try {
      const createdDepartment = await this.prisma.department.create({
        data: {
          id: department.id,
          clinicId: department.clinicId,
          name: department.name,
          description: department.description,
          color: department.color,
          createdAt: department.createdAt,
          updatedAt: department.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdDepartment);
    } catch (error) {
      this.logger.error(
        `Error creating department: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update an existing department
   */
  async update(
    id: string,
    clinicId: string,
    data: Partial<Department>,
  ): Promise<Department> {
    try {
      const updatedDepartment = await this.prisma.department.update({
        where: {
          id,
          clinicId,
        },
        data,
      });

      return this.mapToDomainEntity(updatedDepartment);
    } catch (error) {
      this.logger.error(
        `Error updating department: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a department
   */
  async delete(id: string, clinicId: string): Promise<boolean> {
    try {
      const deletedDepartment = await this.prisma.department.delete({
        where: {
          id,
          clinicId,
        },
      });

      return deletedDepartment != null;
    } catch (error) {
      this.logger.error(
        `Error deleting department: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaDepartment: any): Department {
    return new Department({
      id: prismaDepartment.id,
      clinicId: prismaDepartment.clinicId,
      name: prismaDepartment.name,
      description: prismaDepartment.description,
      color: prismaDepartment.color,
      createdAt: prismaDepartment.createdAt,
      updatedAt: prismaDepartment.updatedAt,
    });
  }
}
