import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IDepartmentRepository } from '../../../domain/department/interfaces/department.repository.interface';
import { Department } from '../../../domain/department/entities/department.entity';

// 定義 Prisma Department 模型的型別
interface PrismaDepartment {
  id: string;
  clinicId: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaDepartmentRepository implements IDepartmentRepository {
  private readonly logger = new Logger(PrismaDepartmentRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Helper method to check if an error is an Error object
   */
  private isError(error: unknown): error is Error {
    return error instanceof Error;
  }

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
        this.mapToDomainEntity(department as PrismaDepartment),
      );
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding all departments: ${errorMessage}`,
        errorStack,
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

      return this.mapToDomainEntity(department as PrismaDepartment);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding department by ID: ${errorMessage}`,
        errorStack,
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

      return this.mapToDomainEntity(createdDepartment as PrismaDepartment);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error creating department: ${errorMessage}`,
        errorStack,
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

      return this.mapToDomainEntity(updatedDepartment as PrismaDepartment);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error updating department: ${errorMessage}`,
        errorStack,
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
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error deleting department: ${errorMessage}`,
        errorStack,
      );
      return false;
    }
  }

  // Helper method to map Prisma model to domain entity with type safety
  private mapToDomainEntity(prismaDepartment: PrismaDepartment): Department {
    return new Department({
      id: prismaDepartment.id,
      clinicId: prismaDepartment.clinicId,
      name: prismaDepartment.name,
      description: prismaDepartment.description || undefined,
      color: prismaDepartment.color || undefined,
      createdAt: prismaDepartment.createdAt,
      updatedAt: prismaDepartment.updatedAt,
    });
  }
}
