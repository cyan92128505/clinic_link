import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsISO8601,
  IsUUID,
} from 'class-validator';
import { Transform, Type, TransformFnParams } from 'class-transformer';
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
  patientId!: string; // 使用 ! 修飾符表示這是必填屬性，但在建構時可能不會有值

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
    example: '2023-12-31T14:30:00+08:00',
  })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  appointmentTime?: Date;

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
    example: '2023-12-31T14:30:00+08:00',
  })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  appointmentTime?: Date;

  @ApiPropertyOptional({
    description: 'Check-in time',
    example: '2023-12-31T14:25:00+08:00',
  })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  checkinTime?: Date;

  @ApiPropertyOptional({
    description: 'Start time',
    example: '2023-12-31T14:35:00+08:00',
  })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  startTime?: Date;

  @ApiPropertyOptional({
    description: 'End time',
    example: '2023-12-31T14:50:00+08:00',
  })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  endTime?: Date;

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
  @Transform(({ value }: TransformFnParams): string | undefined => {
    // Validate and normalize date string
    if (!value || typeof value !== 'string') return undefined;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(value)) {
      return value;
    }
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  })
  date?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by date range start',
    example: '2023-12-01',
  })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  @Transform(({ value }: TransformFnParams): Date | undefined => {
    // Transform to start of day in Taiwan timezone
    if (!value || !(value instanceof Date)) return undefined;
    const date = new Date(value);
    return new Date(date.setHours(0, 0, 0, 0));
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by date range end',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  @Transform(({ value }: TransformFnParams): Date | undefined => {
    // Transform to end of day in Taiwan timezone
    if (!value || !(value instanceof Date)) return undefined;
    const date = new Date(value);
    return new Date(date.setHours(23, 59, 59, 999));
  })
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by doctor ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by patient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  patientId?: string;
}
