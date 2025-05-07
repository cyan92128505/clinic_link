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
import { ActivityLog } from '../../../../domain/activity_log/entities/activity_log.entity';

// 定義分頁返回結果的介面
interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// 定義 findAll 方法的返回型別
type FindAllResult = PaginatedResult<ActivityLog>;

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
    // 使用型別斷言進行明確的型別指定
    const result = (await this.activityLogRepository.findAll({
      clinicId: query.clinicId,
      startDate: query.startDate,
      endDate: query.endDate,
      userId: query.userId,
      action: query.action,
      resource: query.resource,
      page: query.pagination.page,
      limit: query.pagination.limit,
    })) as FindAllResult;

    const { items: activityLogs, meta } = result;

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
