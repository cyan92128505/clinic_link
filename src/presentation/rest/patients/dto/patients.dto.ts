import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDate,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from 'src/domain/patient/value_objects/gender.enum';

// Query DTOs
export class GetClinicPatientsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name, phone, or patient number',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of patients per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}

// Request DTOs
export class CreateClinicPatientDto {
  @ApiProperty({ description: 'Patient full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Patient phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0[2-9]\d{7,8}$/, {
    message:
      'Invalid Taiwan phone number format. Example: 0912345678 or 0223456789',
  })
  phone: string;

  @ApiPropertyOptional({ description: 'Patient national ID' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][12]\d{8}$/, {
    message: 'Invalid Taiwan national ID format. Example: A123456789',
  })
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Patient birth date', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'Patient gender',
    enum: Gender,
    enumName: 'Gender',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Patient email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Patient home address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^0[2-9]\d{7,8}$/, {
    message:
      'Invalid Taiwan phone number format. Example: 0912345678 or 0223456789',
  })
  emergencyPhone?: string;

  @ApiPropertyOptional({ description: 'Additional notes about this patient' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateClinicPatientDto {
  @ApiPropertyOptional({ description: 'Patient full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Patient phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^0[2-9]\d{7,8}$/, {
    message:
      'Invalid Taiwan phone number format. Example: 0912345678 or 0223456789',
  })
  phone?: string;

  @ApiPropertyOptional({ description: 'Patient national ID' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][12]\d{8}$/, {
    message: 'Invalid Taiwan national ID format. Example: A123456789',
  })
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Patient birth date', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'Patient gender',
    enum: Gender,
    enumName: 'Gender',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Patient email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Patient home address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^0[2-9]\d{7,8}$/, {
    message:
      'Invalid Taiwan phone number format. Example: 0912345678 or 0223456789',
  })
  emergencyPhone?: string;

  @ApiPropertyOptional({ description: 'Additional notes about this patient' })
  @IsOptional()
  @IsString()
  note?: string;
}

// Response DTOs
export class PatientClinicInfoDto {
  @ApiProperty({ description: 'Clinic-specific patient number' })
  patientNumber?: string;

  @ApiProperty({ description: 'First visit date to this clinic' })
  firstVisitDate: Date;

  @ApiProperty({ description: 'Last visit date to this clinic' })
  lastVisitDate: Date;

  @ApiProperty({ description: 'Active status in this clinic' })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Clinic-specific patient medical history',
  })
  medicalHistory?: any;

  @ApiPropertyOptional({ description: 'Clinic-specific patient notes' })
  note?: string;
}

export class PatientDto {
  @ApiProperty({ description: 'Patient ID' })
  id: string;

  @ApiProperty({ description: 'Patient full name' })
  name: string;

  @ApiProperty({ description: 'Patient phone number' })
  phone: string;

  @ApiPropertyOptional({ description: 'Patient national ID' })
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Patient birth date' })
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'Patient gender',
    enum: Gender,
    enumName: 'Gender',
  })
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Patient email address' })
  email?: string;

  @ApiPropertyOptional({ description: 'Patient home address' })
  address?: string;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone number' })
  emergencyPhone?: string;

  @ApiProperty({ description: 'Patient creation timestamp' })
  createdAt?: Date;

  @ApiProperty({ description: 'Patient last update timestamp' })
  updatedAt?: Date;

  @ApiProperty({ description: 'Patient information in current clinic' })
  clinicInfo: PatientClinicInfoDto;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of patients' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of patients per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class GetClinicPatientsResponseDto {
  @ApiProperty({
    description: 'List of patients',
    type: [PatientDto],
  })
  data: PatientDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

export class CreateClinicPatientResponseDto extends PatientDto {}

export class GetClinicPatientByIdResponseDto extends PatientDto {}

export class UpdateClinicPatientResponseDto extends PatientDto {}
