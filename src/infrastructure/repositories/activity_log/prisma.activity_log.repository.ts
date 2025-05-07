import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IActivityLogRepository } from '../../../domain/activity_log/interfaces/activity_log.repository.interface';
import { ActivityLog } from '../../../domain/activity_log/entities/activity_log.entity';
import { Prisma } from '@prisma/client';

// 定義 Prisma ActivityLog 型別
type PrismaActivityLog = Prisma.ActivityLogGetPayload<{
  select: {
    id: true;
    clinicId: true;
    userId: true;
    action: true;
    resource: true;
    resourceId: true;
    details: true;
    ipAddress: true;
    userAgent: true;
    createdAt: true;
  };
}>;

// 為 findAll 方法定義過濾參數介面，與介面聲明匹配
interface ActivityLogFilter {
  clinicId: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resource?: string;
  page: number;
  limit: number;
}

@Injectable()
export class PrismaActivityLogRepository implements IActivityLogRepository {
  private readonly logger = new Logger(PrismaActivityLogRepository.name);
  private readonly DEFAULT_LIMIT = 100; // Default limit for queries

  constructor(private prisma: PrismaService) {}

  /**
   * Find all activity logs with pagination and filtering
   */
  async findAll(
    filter: ActivityLogFilter,
  ): Promise<{ items: ActivityLog[]; meta: any }> {
    try {
      const {
        clinicId,
        startDate,
        endDate,
        userId,
        action,
        resource,
        page = 1,
        limit = this.DEFAULT_LIMIT,
      } = filter;

      const skip = (page - 1) * limit;

      // 建立 where 查詢條件
      const where: Prisma.ActivityLogWhereInput = {
        clinicId,
      };

      // 添加可選過濾條件
      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      if (userId) {
        where.userId = userId;
      }

      if (action) {
        where.action = action;
      }

      if (resource) {
        where.resource = resource;
      }

      const [logs, total] = await Promise.all([
        this.prisma.activityLog.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        this.prisma.activityLog.count({ where }),
      ]);

      // 回傳符合介面期望的結構
      return {
        items: logs.map((log) => this.mapToDomainEntity(log)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding all activity logs: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error finding all activity logs: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Create a new activity log entry
   */
  async create(log: ActivityLog): Promise<ActivityLog> {
    try {
      const createdLog = await this.prisma.activityLog.create({
        data: {
          id: log.id,
          clinicId: log.clinicId,
          userId: log.userId,
          action: log.action,
          resource: log.resource,
          resourceId: log.resourceId,
          // 正確處理 JSON 欄位
          details: log.details as Prisma.InputJsonValue,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: log.createdAt,
        },
      });

      return this.mapToDomainEntity(createdLog);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating activity log: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error creating activity log: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Find activity logs by clinic with optional limit
   */
  async findByClinic(clinicId: string, limit?: number): Promise<ActivityLog[]> {
    try {
      const logs = await this.prisma.activityLog.findMany({
        where: {
          clinicId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit || this.DEFAULT_LIMIT,
      });

      return logs.map((log) => this.mapToDomainEntity(log));
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding activity logs by clinic: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Error finding activity logs by clinic: Unknown error',
        );
      }
      throw error;
    }
  }

  /**
   * Find activity logs by user with optional limit
   */
  async findByUser(userId: string, limit?: number): Promise<ActivityLog[]> {
    try {
      const logs = await this.prisma.activityLog.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit || this.DEFAULT_LIMIT,
      });

      return logs.map((log) => this.mapToDomainEntity(log));
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding activity logs by user: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error finding activity logs by user: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Find activity logs by resource type and optional resource ID
   */
  async findByResource(
    clinicId: string,
    resource: string,
    resourceId?: string,
  ): Promise<ActivityLog[]> {
    try {
      // 使用型別安全的 where 物件
      const where: Prisma.ActivityLogWhereInput = {
        clinicId,
        resource,
      };

      if (resourceId) {
        where.resourceId = resourceId;
      }

      const logs = await this.prisma.activityLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: this.DEFAULT_LIMIT,
      });

      return logs.map((log) => this.mapToDomainEntity(log));
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding activity logs by resource: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Error finding activity logs by resource: Unknown error',
        );
      }
      throw error;
    }
  }

  /**
   * Find activity logs within a date range
   */
  async findByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ActivityLog[]> {
    try {
      const logs = await this.prisma.activityLog.findMany({
        where: {
          clinicId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return logs.map((log) => this.mapToDomainEntity(log));
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding activity logs by date range: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Error finding activity logs by date range: Unknown error',
        );
      }
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity with null handling
  private mapToDomainEntity(prismaLog: PrismaActivityLog): ActivityLog {
    return new ActivityLog({
      id: prismaLog.id,
      clinicId: prismaLog.clinicId,
      userId: prismaLog.userId,
      action: prismaLog.action,
      resource: prismaLog.resource,
      // 正確處理 null 值
      resourceId: prismaLog.resourceId || undefined,
      details: prismaLog.details as Record<string, unknown>,
      ipAddress: prismaLog.ipAddress || undefined,
      userAgent: prismaLog.userAgent || undefined,
      createdAt: prismaLog.createdAt,
    });
  }
}
