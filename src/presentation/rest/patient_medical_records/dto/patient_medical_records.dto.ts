import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsDate, IsInt, Min, Max } from 'class-validator';

// Request DTOs
export class GetPatientMedicalRecordsQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering medical records',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for filtering medical records',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 20;
}

// Response DTOs
export class MedicationDto {
  @ApiProperty({ description: 'Medication name' })
  name: string;

  @ApiProperty({ description: 'Medication dosage' })
  dosage: string;

  @ApiProperty({ description: 'Medication frequency' })
  frequency: string;

  @ApiProperty({ description: 'Medication duration' })
  duration: string;

  @ApiPropertyOptional({ description: 'Additional instructions' })
  instructions?: string;
}

export class PrescriptionDto {
  @ApiProperty({
    description: 'List of medications',
    type: [MedicationDto],
  })
  medications: MedicationDto[];
}

export class MedicalRecordDto {
  @ApiProperty({ description: 'Medical record ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Associated appointment ID' })
  appointmentId?: string;

  @ApiProperty({ description: 'Date of the medical record' })
  recordDate: Date;

  @ApiProperty({ description: 'Type of medical record' })
  recordType: string;

  @ApiPropertyOptional({ description: 'Diagnosis' })
  diagnosis?: string;

  @ApiPropertyOptional({
    description: 'Symptoms reported by patient',
    type: [String],
  })
  symptoms?: string[];

  @ApiPropertyOptional({
    description: 'Prescription information',
    type: PrescriptionDto,
  })
  prescription?: PrescriptionDto;

  @ApiPropertyOptional({ description: 'Treatment plan' })
  treatment?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Doctor ID' })
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Doctor name' })
  doctorName?: string;

  @ApiPropertyOptional({ description: 'Record creation timestamp' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Record last update timestamp' })
  updatedAt?: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of records per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class GetPatientMedicalRecordsResponseDto {
  @ApiProperty({ description: 'Patient ID' })
  patientId: string;

  @ApiProperty({ description: 'Patient name' })
  patientName: string;

  @ApiProperty({ description: 'Clinic ID' })
  clinicId: string;

  @ApiProperty({ description: 'Clinic name' })
  clinicName: string;

  @ApiPropertyOptional({ description: 'Clinic-specific patient number' })
  patientNumber?: string;

  @ApiProperty({
    description: 'List of medical records',
    type: [MedicalRecordDto],
  })
  records: MedicalRecordDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
