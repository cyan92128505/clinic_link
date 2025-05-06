import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IDepartmentRepository } from '../../../../domain/department/interfaces/department.repository.interface';
import { IClinicRepository } from '../../../../domain/clinic/interfaces/clinic.repository.interface';
import { GetDepartmentsQuery } from './get_departments.query';
import {
  DepartmentDto,
  GetDepartmentsResponse,
} from './get_departments.response';

/**
 * Handler for retrieving all departments in a clinic
 */
@Injectable()
export class GetDepartmentsHandler {
  private readonly logger = new Logger(GetDepartmentsHandler.name);

  constructor(
    @Inject('IDepartmentRepository')
    private readonly departmentRepository: IDepartmentRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  /**
   * Execute the query to retrieve departments for a clinic
   * @param query Query parameters including clinic ID
   * @returns List of departments in the specified clinic
   */
  async execute(query: GetDepartmentsQuery): Promise<GetDepartmentsResponse> {
    this.logger.debug(`Getting departments for clinic: ${query.clinicId}`);

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(query.clinicId);
    if (!clinic) {
      this.logger.warn(`Clinic not found with ID: ${query.clinicId}`);
      throw new NotFoundException('Clinic not found');
    }

    // Get all departments for the clinic
    const departments = await this.departmentRepository.findAll(query.clinicId);

    // Map to DTOs
    const departmentDtos = departments.map(
      (department) => new DepartmentDto(department),
    );

    this.logger.debug(
      `Found ${departmentDtos.length} departments for clinic: ${query.clinicId}`,
    );

    return new GetDepartmentsResponse(departmentDtos);
  }
}
