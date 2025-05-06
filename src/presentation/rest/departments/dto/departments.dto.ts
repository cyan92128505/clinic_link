import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentDto } from '../../../../usecases/departments/queries/get_departments/get_departments.response';

/**
 * DTO for department information response
 */
export class DepartmentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the department',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the department',
    example: 'Cardiology',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the department',
    example: 'Deals with heart-related conditions',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Color code for UI display',
    example: '#FF5733',
  })
  color?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-02T00:00:00Z',
  })
  updatedAt?: Date;

  constructor(departmentDto: DepartmentDto) {
    this.id = departmentDto.id;
    this.name = departmentDto.name;
    this.description = departmentDto.description;
    this.color = departmentDto.color;
    this.createdAt = departmentDto.createdAt;
    this.updatedAt = departmentDto.updatedAt;
  }
}

/**
 * Response structure for departments list
 */
export class DepartmentsResponseDto {
  @ApiProperty({
    description: 'List of departments',
    type: [DepartmentResponseDto],
  })
  departments: DepartmentResponseDto[];

  constructor(departments: DepartmentDto[]) {
    this.departments = departments.map(
      (department) => new DepartmentResponseDto(department),
    );
  }
}
