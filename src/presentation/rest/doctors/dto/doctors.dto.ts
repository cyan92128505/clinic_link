import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DoctorDto } from '../../../../usecases/doctors/queries/get_doctors/get_doctors.response';

/**
 * DTO for doctor information response
 */
export class DoctorResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the doctor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the doctor',
    example: 'Dr. 林醫師',
  })
  name: string;

  @ApiProperty({
    description: 'Department ID the doctor belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  departmentId: string;

  @ApiPropertyOptional({
    description: 'Professional title',
    example: '主治醫師',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Medical specialty',
    example: '心臟科專科',
  })
  specialty?: string;

  @ApiPropertyOptional({
    description: 'Medical license number',
    example: 'MED-12345',
  })
  licenseNumber?: string;

  @ApiPropertyOptional({
    description: 'Doctor biography',
    example: '專精於心血管疾病治療，有15年臨床經驗',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL',
    example: 'https://example.com/avatars/doctor1.jpg',
  })
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Associated user ID if doctor is also a system user',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Doctor schedule data',
    example: '{ "monday": {"start": "09:00", "end": "17:00"} }',
  })
  scheduleData?: Record<string, any>;

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

  constructor(doctorDto: DoctorDto) {
    this.id = doctorDto.id;
    this.name = doctorDto.name;
    this.departmentId = doctorDto.departmentId;
    this.title = doctorDto.title;
    this.specialty = doctorDto.specialty;
    this.licenseNumber = doctorDto.licenseNumber;
    this.bio = doctorDto.bio;
    this.avatar = doctorDto.avatar;
    this.userId = doctorDto.userId;
    this.scheduleData = doctorDto.scheduleData;
    this.createdAt = doctorDto.createdAt;
    this.updatedAt = doctorDto.updatedAt;
  }
}

/**
 * Response structure for doctors list
 */
export class DoctorsResponseDto {
  @ApiProperty({
    description: 'List of doctors',
    type: [DoctorResponseDto],
  })
  doctors: DoctorResponseDto[];

  constructor(doctors: DoctorDto[]) {
    this.doctors = doctors.map((doctor) => new DoctorResponseDto(doctor));
  }
}
