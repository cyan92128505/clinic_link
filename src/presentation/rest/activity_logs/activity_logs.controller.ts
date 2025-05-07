import {
  Controller,
  Get,
  Logger,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt_auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { Role } from '../../../domain/user/value_objects/role.enum';
import { GetActivityLogsHandler } from '../../../usecases/activity_logs/queries/get_activity_logs/get_activity_logs.handler';
import { GetActivityLogsQuery } from '../../../usecases/activity_logs/queries/get_activity_logs/get_activity_logs.query';
import { ActivityLogsResponseDto } from './dto/activity_logs.dto';
import { PaginationQueryParams } from '../../../usecases/common/dtos/pagination.dto';

// Define interface for authenticated user
interface UserClinic {
  clinicId: string;
  role: Role;
}

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    selectedClinicId: string;
    clinics?: UserClinic[];
  };
}

/**
 * Controller for activity logs endpoints
 */
@ApiTags('activity-logs')
@Controller('api/v1/activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActivityLogsController {
  private readonly logger = new Logger(ActivityLogsController.name);

  constructor(
    private readonly getActivityLogsHandler: GetActivityLogsHandler,
  ) {}

  /**
   * Get activity logs for the current clinic with filters and pagination
   */
  @Get()
  @Roles(Role.ADMIN, Role.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Get activity logs with filters and pagination' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter logs from this date',
    type: Date,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter logs until this date',
    type: Date,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter logs by user ID',
    type: String,
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Filter logs by action type',
    type: String,
  })
  @ApiQuery({
    name: 'resource',
    required: false,
    description: 'Filter logs by resource type',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Activity logs retrieved successfully',
    type: ActivityLogsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
  async getActivityLogs(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ): Promise<ActivityLogsResponseDto> {
    this.logger.debug(
      `Getting activity logs for clinic. Filters: startDate=${startDate}, endDate=${endDate}, userId=${userId}, action=${action}, resource=${resource}, page=${page}, limit=${limit}`,
    );

    // Extract clinic ID from the authenticated user's context
    const clinicId = req.user.selectedClinicId;

    if (!clinicId) {
      this.logger.warn('No clinic selected for user');
      throw new Error('No clinic selected. Please select a clinic first.');
    }

    // Check if user has the required role for this clinic
    const userClinic = req.user.clinics?.find(
      (c: UserClinic) => c.clinicId === clinicId,
    );
    if (
      !userClinic ||
      ![Role.ADMIN, Role.CLINIC_ADMIN].includes(userClinic.role)
    ) {
      this.logger.warn(
        `User ${req.user.id} does not have permission to view activity logs for clinic ${clinicId}`,
      );
      throw new ForbiddenException(
        'You do not have permission to view activity logs',
      );
    }

    // Parse date strings to Date objects if provided
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    // Create pagination params
    const pagination: PaginationQueryParams = {
      page,
      limit,
    };

    // Create query and execute handler
    const query = new GetActivityLogsQuery(
      clinicId,
      startDateObj,
      endDateObj,
      userId,
      action,
      resource,
      pagination,
    );

    const response = await this.getActivityLogsHandler.execute(query);

    // Map to response DTO
    return new ActivityLogsResponseDto(response.data, response.meta);
  }
}
