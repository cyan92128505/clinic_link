import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IActivityLogRepository } from '../../../domain/activity-log/interfaces/activity-log.repository.interface';
import { ActivityLog } from '../../../domain/activity-log/entities/activity-log.entity';

@Injectable()
export class PrismaActivityLogRepository implements IActivityLogRepository {
  private readonly logger = new Logger(PrismaActivityLogRepository.name);
  private readonly DEFAULT_LIMIT = 100; // Default limit for queries

  constructor(private prisma: PrismaService) {}

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
          details: log.details as any, // Cast to any for JSON field
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: log.createdAt,
        },
      });

      return this.mapToDomainEntity(createdLog);
    } catch (error) {
      this.logger.error(
        `Error creating activity log: ${error.message}`,
        error.stack,
      );
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
    } catch (error) {
      this.logger.error(
        `Error finding activity logs by clinic: ${error.message}`,
        error.stack,
      );
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
    } catch (error) {
      this.logger.error(
        `Error finding activity logs by user: ${error.message}`,
        error.stack,
      );
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
      const where: any = {
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
    } catch (error) {
      this.logger.error(
        `Error finding activity logs by resource: ${error.message}`,
        error.stack,
      );
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
    } catch (error) {
      this.logger.error(
        `Error finding activity logs by date range: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaLog: any): ActivityLog {
    return new ActivityLog({
      id: prismaLog.id,
      clinicId: prismaLog.clinicId,
      userId: prismaLog.userId,
      action: prismaLog.action,
      resource: prismaLog.resource,
      resourceId: prismaLog.resourceId,
      details: prismaLog.details,
      ipAddress: prismaLog.ipAddress,
      userAgent: prismaLog.userAgent,
      createdAt: prismaLog.createdAt,
    });
  }
}
