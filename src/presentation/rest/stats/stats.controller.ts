import {
  Controller,
  Get,
  Logger,
  UseGuards,
  Request,
  Query,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt_auth.guard';
import { GetDashboardStatsQuery } from '../../../usecases/stats/queries/get_dashboard_stats/get_dashboard_stats.query';
import { DashboardStatsResponseDto } from './dto/stats.dto';
import { Role } from '../../../domain/user/value_objects/role.enum';
import { GetDashboardStatsResponse } from '../../../usecases/stats/queries/get_dashboard_stats/get_dashboard_stats.response';

// 定義請求物件型別
interface RequestWithUser {
  user: {
    id: string;
    selectedClinicId: string;
    clinics?: Array<{
      clinicId: string;
      role: Role;
    }>;
  };
}

// 定義處理器介面
interface GetDashboardStatsHandler {
  execute(query: GetDashboardStatsQuery): Promise<GetDashboardStatsResponse>;
}

/**
 * Controller for statistics-related endpoints
 */
@ApiTags('statistics')
@Controller('api/v1/stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  private readonly logger = new Logger(StatsController.name);

  constructor(
    @Inject('GetDashboardStatsHandler')
    private readonly dashboardStatsHandler: GetDashboardStatsHandler,
  ) {}

  /**
   * Get dashboard statistics for the current clinic
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date for which to retrieve statistics (default: today)',
    type: String,
    example: '2023-05-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Clinic not found' })
  async getDashboardStats(
    @Request() req: RequestWithUser,
    @Query('date') dateString?: string,
  ): Promise<DashboardStatsResponseDto> {
    // Extract clinic ID from the authenticated user's context
    const clinicId = req.user.selectedClinicId;

    if (!clinicId) {
      this.logger.warn('No clinic selected for user');
      throw new Error('No clinic selected. Please select a clinic first.');
    }

    // Parse date if provided, otherwise use today
    let date: Date | undefined;
    if (dateString) {
      date = new Date(dateString);
      this.logger.debug(
        `Getting dashboard statistics for date: ${date.toISOString()}`,
      );
    } else {
      this.logger.debug('Getting dashboard statistics for today');
    }

    // 取得使用者角色，確保不為 undefined
    const userRole =
      req.user.clinics?.find((c) => c.clinicId === clinicId)?.role ||
      Role.STAFF;

    // Create requestedBy information for access control
    const requestedBy = {
      userId: req.user.id,
      userRole: userRole, // 確保永遠有值
    };

    // Create query and execute handler
    const query = new GetDashboardStatsQuery(
      clinicId,
      date,
      undefined, // startDate - not used in this endpoint
      undefined, // endDate - not used in this endpoint
      requestedBy,
    );

    // 執行查詢並取得結果
    const response = await this.dashboardStatsHandler.execute(query);

    // Map to response DTO with additional calculated fields
    return new DashboardStatsResponseDto(response);
  }
}
