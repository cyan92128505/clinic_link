import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt_auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';
import { Roles } from 'src/infrastructure/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/infrastructure/auth/decorators/current_user.decorator';
import { Role } from 'src/domain/user/value_objects/role.enum';
import { GetRoomsWithQueueQuery } from 'src/usecases/rooms/queries/get_rooms_with_queue/get_rooms_with_queue.query';
import { GetRoomsWithQueueResponse } from 'src/usecases/rooms/queries/get_rooms_with_queue/get_rooms_with_queue.response';
import { UpdateRoomStatusCommand } from 'src/usecases/rooms/commands/update_room_status/update_room_status.command';
import {
  UpdateRoomStatusDto,
  GetRoomsQueryDto,
  RoomsWithQueueResponseDto,
} from './dto/rooms.dto';
import { BaseController } from 'src/presentation/common/base.controller';
import { Room } from 'src/domain/room/entities/room.entity';
import { Appointment } from 'src/domain/appointment/entities/appointment.entity';
import { RoomStatus } from 'src/domain/room/value_objects/room.enum';

// 定義使用者 DTO 結構
interface UserDto {
  id: string;
  selectedClinicId: string;
  role: Role;
}

// 定義更新房間狀態結果 DTO
interface UpdateRoomStatusResultDto {
  roomId: string;
  clinicId: string;
  previousStatus: RoomStatus;
  newStatus: RoomStatus;
  updated: boolean;
}

// 定義查詢結果型別
interface RoomsWithQueueResult {
  rooms: Array<{
    room: Room;
    queue: Appointment[];
    queueLength: number;
  }>;
  clinicId: string;
  date: Date;
}

@Controller('rooms')
@ApiTags('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoomsController extends BaseController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {
    super('RoomsController');
  }

  /**
   * Get all rooms with queue information
   */
  @Get()
  @ApiOperation({
    summary: 'Get all rooms with queue information',
    description: 'Retrieve all rooms with their queue and status information',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of rooms with status and queue',
    type: RoomsWithQueueResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(
    Role.ADMIN,
    Role.CLINIC_ADMIN,
    Role.DOCTOR,
    Role.NURSE,
    Role.RECEPTIONIST,
    Role.STAFF,
  )
  async getRoomsWithQueue(
    @CurrentUser() user: UserDto,
    @Query() queryDto: GetRoomsQueryDto,
  ) {
    // Check if a clinic is selected
    if (!user.selectedClinicId) {
      throw new UnauthorizedException('No clinic selected');
    }

    // Convert date string to Date object if provided
    let date: Date | undefined;
    if (queryDto.date) {
      date = new Date(queryDto.date);
      // Validate date is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
    }

    // Create and execute query
    const query = new GetRoomsWithQueueQuery(
      user.selectedClinicId,
      queryDto.status,
      queryDto.doctorId,
      queryDto.appointmentStatus,
      date,
      {
        userId: user.id,
        userRole: user.role,
      },
    );

    try {
      // 執行查詢並指定回傳型別
      const result = await this.queryBus.execute<
        GetRoomsWithQueueQuery,
        RoomsWithQueueResult
      >(query);

      const response = GetRoomsWithQueueResponse.fromHandler(result);

      // Return detailed response for staff, public response for patients
      return response.toDetailedResponse();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error retrieving rooms with queue: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        'Error retrieving rooms information',
      );
    }
  }

  /**
   * Update room status
   */
  @Put(':roomId')
  @ApiOperation({
    summary: 'Update room status',
    description: 'Update the status of a specific room',
  })
  @ApiResponse({
    status: 200,
    description: 'Room status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Roles(
    Role.ADMIN,
    Role.CLINIC_ADMIN,
    Role.DOCTOR,
    Role.NURSE,
    Role.RECEPTIONIST,
  )
  async updateRoomStatus(
    @CurrentUser() user: UserDto,
    @Param('roomId') roomId: string,
    @Body() updateRoomStatusDto: UpdateRoomStatusDto,
  ) {
    // Check if a clinic is selected
    if (!user.selectedClinicId) {
      throw new UnauthorizedException('No clinic selected');
    }

    // Create and execute command
    const command = new UpdateRoomStatusCommand(
      user.selectedClinicId,
      roomId,
      updateRoomStatusDto.status,
      {
        userId: user.id,
        userRole: user.role,
      },
    );

    try {
      // 執行命令並取得結果
      const result = await this.commandBus.execute<
        UpdateRoomStatusCommand,
        UpdateRoomStatusResultDto
      >(command);

      // Return result
      return {
        roomId: result.roomId,
        clinicId: result.clinicId,
        previousStatus: result.previousStatus,
        newStatus: result.newStatus,
        updated: result.updated,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw new NotFoundException(error.message);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error updating room status: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException('Error updating room status');
    }
  }
}
