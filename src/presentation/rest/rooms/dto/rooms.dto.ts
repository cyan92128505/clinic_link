import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RoomStatus } from 'src/domain/room/value_objects/room.enum';
import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';

/**
 * DTO for updating room status
 */
export class UpdateRoomStatusDto {
  @ApiProperty({
    description: 'New room status',
    enum: RoomStatus,
    example: RoomStatus.OPEN,
  })
  @IsNotEmpty()
  @IsEnum(RoomStatus)
  status!: RoomStatus;
}

/**
 * DTO for filtering rooms
 */
export class GetRoomsQueryDto {
  @ApiProperty({
    description: 'Filter by room status',
    enum: RoomStatus,
    required: false,
    example: RoomStatus.OPEN,
  })
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @ApiProperty({
    description: 'Filter by doctor ID',
    required: false,
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  @IsString()
  doctorId?: string;

  @ApiProperty({
    description: 'Filter appointments by status',
    enum: AppointmentStatus,
    required: false,
    example: AppointmentStatus.CHECKED_IN,
  })
  @IsEnum(AppointmentStatus)
  appointmentStatus?: AppointmentStatus;

  @ApiProperty({
    description: 'Filter by date (format: YYYY-MM-DD)',
    required: false,
    example: '2025-05-07',
  })
  date?: string;
}

/**
 * Response DTO for a room with queue information
 */
export class RoomWithQueueDto {
  @ApiProperty({
    description: 'Room ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  roomId!: string;

  @ApiProperty({
    description: 'Room name',
    example: '診間 101',
  })
  name!: string;

  @ApiProperty({
    description: 'Room description',
    example: '兒科診間',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Room status',
    enum: RoomStatus,
    example: RoomStatus.OPEN,
  })
  status!: RoomStatus;

  @ApiProperty({
    description: 'Number of appointments in queue',
    example: 5,
  })
  queueLength!: number;

  @ApiProperty({
    description: 'Next appointment information',
    required: false,
  })
  nextAppointment?: {
    appointmentId: string;
    appointmentNumber?: number;
    appointmentTime?: Date;
    status: AppointmentStatus;
  };
}

/**
 * Response DTO for the rooms with queue information endpoint
 */
export class RoomsWithQueueResponseDto {
  @ApiProperty({
    description: 'Clinic ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  clinicId!: string;

  @ApiProperty({
    description: 'Date of queue information',
    example: '2025-05-07T00:00:00.000Z',
  })
  date!: Date;

  @ApiProperty({
    description: 'Rooms with queue information',
    type: [RoomWithQueueDto],
  })
  rooms!: RoomWithQueueDto[];
}
