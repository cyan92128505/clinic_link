import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  AppointmentStatus,
  AppointmentSource,
} from '../../../../domain/appointment/value_objects/appointment.enum';

export class CreatePatientAppointmentDto {
  @ApiProperty({
    description: 'Clinic ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  @IsNotEmpty()
  @IsString()
  clinicId!: string;

  @ApiPropertyOptional({
    description: 'Doctor ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c3d',
  })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c4e',
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Appointment time (ISO format)',
    example: '2023-12-31T14:30:00+08:00',
  })
  @IsOptional()
  @IsDateString()
  appointmentTime!: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the appointment',
    example: '初診，需要詳細檢查',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdatePatientAppointmentDto {
  @ApiProperty({
    description: 'Clinic ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  clinicId!: string;

  @ApiPropertyOptional({
    description: 'Appointment time (ISO format)',
    example: '2023-12-31T14:30:00+08:00',
  })
  @IsOptional()
  @IsDateString()
  appointmentTime?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the appointment',
    example: '因上班需求，希望能提早到診',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class PatientAppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c5f',
  })
  id!: string;

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

  @ApiProperty({
    description: 'Patient ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c2d',
  })
  patientId!: string;

  @ApiPropertyOptional({
    description: 'Doctor ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c3d',
  })
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Doctor name',
    example: '王大明醫師',
  })
  doctorName?: string;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c4e',
  })
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Department name',
    example: '家醫科',
  })
  departmentName?: string;

  @ApiPropertyOptional({
    description: 'Room ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c6g',
  })
  roomId?: string;

  @ApiPropertyOptional({
    description: 'Room name',
    example: '診間 3',
  })
  roomName?: string;

  @ApiPropertyOptional({
    description: 'Appointment number',
    example: 5,
  })
  appointmentNumber?: number;

  @ApiPropertyOptional({
    description: 'Appointment time (ISO format)',
    example: '2023-12-31T14:30:00+08:00',
  })
  appointmentTime?: Date;

  @ApiPropertyOptional({
    description: 'Check-in time (ISO format)',
    example: '2023-12-31T14:25:00+08:00',
  })
  checkinTime?: Date;

  @ApiPropertyOptional({
    description: 'Start time (ISO format)',
    example: '2023-12-31T14:35:00+08:00',
  })
  startTime?: Date;

  @ApiPropertyOptional({
    description: 'End time (ISO format)',
    example: '2023-12-31T14:50:00+08:00',
  })
  endTime?: Date;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  status!: AppointmentStatus;

  @ApiProperty({
    description: 'Appointment source',
    enum: AppointmentSource,
    example: AppointmentSource.ONLINE,
  })
  source!: AppointmentSource;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: '初診，需要詳細檢查',
  })
  note?: string;

  @ApiProperty({
    description: 'Creation date of the appointment',
    example: '2023-12-30T10:15:00+08:00',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update date of the appointment',
    example: '2023-12-30T10:15:00+08:00',
  })
  updatedAt!: Date;
}

export class PatientAppointmentListResponseDto {
  @ApiProperty({
    description: 'List of appointments',
    type: [PatientAppointmentResponseDto],
  })
  data!: PatientAppointmentResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      total: 10,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  })
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
