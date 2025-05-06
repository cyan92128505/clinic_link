import { Department } from '../../../../domain/department/entities/department.entity';

/**
 * DTO for department information
 */
export class DepartmentDto {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(department: Department) {
    this.id = department.id;
    this.name = department.name;
    this.description = department.description;
    this.color = department.color;
    this.createdAt = department.createdAt;
    this.updatedAt = department.updatedAt;
  }
}

/**
 * Response structure for departments query
 */
export class GetDepartmentsResponse {
  departments: DepartmentDto[];

  constructor(departments: DepartmentDto[]) {
    this.departments = departments;
  }
}
