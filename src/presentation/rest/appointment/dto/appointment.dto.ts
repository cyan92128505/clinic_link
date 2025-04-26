import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsISO8601,
  IsUUID,
} from 'class-validator';
import {
  AppointmentStatus,
  AppointmentSource,
} from '../../../../domain/appointment/value_objects/appointment.enum';

// Create Appointment DTO
export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Patient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({
    description: 'Doctor ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Appointment time',
    example: '2023-12-31T14:30:00Z',
  })
  @IsOptional()
  @IsISO8601()
  appointmentTime?: string;

  @ApiProperty({
    description: 'Appointment source',
    enum: AppointmentSource,
    example: AppointmentSource.WALK_IN,
  })
  @IsEnum(AppointmentSource)
  source: AppointmentSource = AppointmentSource.WALK_IN;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Patient requested afternoon appointment',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

// Update Appointment DTO
export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.CHECKED_IN,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Doctor ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Room ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({
    description: 'Appointment time',
    example: '2023-12-31T14:30:00Z',
  })
  @IsOptional()
  @IsISO8601()
  appointmentTime?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Patient will be late',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

// Query Params DTO
export class GetAppointmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by date (YYYY-MM-DD)',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
