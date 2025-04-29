import { ActivityLog } from '../entities/activity-log.entity';

export interface IActivityLogRepository {
  create(log: ActivityLog): Promise<ActivityLog>;
  findByClinic(clinicId: string, limit?: number): Promise<ActivityLog[]>;
  findByUser(userId: string, limit?: number): Promise<ActivityLog[]>;
  findByResource(
    clinicId: string,
    resource: string,
    resourceId?: string,
  ): Promise<ActivityLog[]>;
  findByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ActivityLog[]>;
}
