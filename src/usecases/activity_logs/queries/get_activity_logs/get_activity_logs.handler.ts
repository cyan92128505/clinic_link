import { Inject, Injectable } from '@nestjs/common';
import { IActivityLogRepository } from '../../../../domain/activity_log/interfaces/activity_log.repository.interface';
import { IUserRepository } from '../../../../domain/user/interfaces/user.repository.interface';
import { GetActivityLogsQuery } from './get_activity_logs.query';
import {
  ActivityLogDto,
  GetActivityLogsResponse,
} from './get_activity_logs.response';
import { ForbiddenException } from '@nestjs/common';
import { PaginationMeta } from '../../../common/dtos/pagination.dto';
import { IClinicRepository } from '../../../../domain/clinic/interfaces/clinic.repository.interface';

@Injectable()
export class GetActivityLogsHandler {
  constructor(
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(query: GetActivityLogsQuery): Promise<GetActivityLogsResponse> {
    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(query.clinicId);
    if (!clinic) {
      throw new ForbiddenException('You do not have access to this clinic');
    }

    // Get activity logs with pagination
    const { items: activityLogs, meta } =
      await this.activityLogRepository.findAll({
        clinicId: query.clinicId,
        startDate: query.startDate,
        endDate: query.endDate,
        userId: query.userId,
        action: query.action,
        resource: query.resource,
        page: query.pagination.page,
        limit: query.pagination.limit,
      });

    // Get user information for each activity log
    const userIds = new Set(activityLogs.map((log) => log.userId));
    const users = await this.userRepository.findByIds(Array.from(userIds));
    const userMap = new Map(users.map((user) => [user.id, user]));

    // Map activity logs to DTOs with user information
    const activityLogDtos = activityLogs.map((log) => {
      const user = userMap.get(log.userId);
      return new ActivityLogDto(
        log,
        user?.name || 'Unknown User',
        user?.email || 'unknown@example.com',
      );
    });

    // Create pagination meta
    const paginationMeta: PaginationMeta = {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: Math.ceil(meta.total / meta.limit),
    };

    return new GetActivityLogsResponse(activityLogDtos, paginationMeta);
  }
}
