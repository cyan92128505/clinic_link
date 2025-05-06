import {
  Controller,
  Get,
  Logger,
  UseGuards,
  Request,
  Query,
  ParseDatePipe,
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
import { GetDashboardStatsResponse } from '../../../usecases/stats/queries/get_dashboard_stats/get_dashboard_stats.response';
import { Inject, Injectable } from '@nestjs/common';

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
    // 修正：使用 Inject 來注入服務
    @Inject('GetDashboardStatsHandler')
    private readonly dashboardStatsHandler: any, // 或者定義一個界面來替代 any
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
    @Request() req,
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

    // Create requestedBy information for access control
    const requestedBy = {
      userId: req.user.id,
      userRole: req.user.clinics?.find((c) => c.clinicId === clinicId)?.role,
    };

    // Create query and execute handler
    const query = new GetDashboardStatsQuery(
      clinicId,
      date,
      undefined, // startDate - not used in this endpoint
      undefined, // endDate - not used in this endpoint
      requestedBy,
    );

    // 修正：使用正確的方法名稱
    const response = await this.dashboardStatsHandler.execute(query);

    // Map to response DTO with additional calculated fields
    return new DashboardStatsResponseDto(response);
  }
}
