import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LinkToClinicDto {
  @ApiPropertyOptional({
    description: 'Clinic-specific patient number',
    example: 'P12345',
  })
  @IsString()
  @IsOptional()
  patientNumber?: string;
}

export class PatientClinicInfoDto {
  @ApiProperty({
    description: 'Clinic ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  clinicId!: string;

  @ApiProperty({
    description: 'Clinic name',
    example: '康健診所',
  })
  clinicName!: string;

  @ApiPropertyOptional({
    description: 'Patient number in this clinic',
    example: 'P12345',
  })
  patientNumber?: string;

  @ApiProperty({
    description: 'First visit date to this clinic',
    example: '2023-01-15T09:30:00.000Z',
  })
  firstVisitDate!: Date;

  @ApiProperty({
    description: 'Last visit date to this clinic',
    example: '2023-05-20T14:45:00.000Z',
  })
  lastVisitDate!: Date;

  @ApiProperty({
    description: 'Total number of visits to this clinic',
    example: 5,
  })
  totalVisits!: number;

  @ApiProperty({
    description: 'Whether patient is active in this clinic',
    example: true,
  })
  isActive!: boolean;
}

export class PatientClinicResponseDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c2d',
  })
  patientId!: string;

  @ApiProperty({
    description: 'Clinic ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  clinicId!: string;

  @ApiPropertyOptional({
    description: 'Patient number in this clinic',
    example: 'P12345',
  })
  patientNumber?: string;

  @ApiProperty({
    description: 'First visit date to this clinic',
    example: '2023-01-15T09:30:00.000Z',
  })
  firstVisitDate!: Date;

  @ApiProperty({
    description: 'Last visit date to this clinic',
    example: '2023-05-20T14:45:00.000Z',
  })
  lastVisitDate!: Date;

  @ApiProperty({
    description: 'Whether patient is active in this clinic',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Creation date of the link',
    example: '2023-01-15T09:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update date of the link',
    example: '2023-05-20T14:45:00.000Z',
  })
  updatedAt!: Date;
}
