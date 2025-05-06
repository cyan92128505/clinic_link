import { ActivityLog } from '../entities/activity_log.entity';

export interface IActivityLogRepository {
  findAll(arg0: {
    clinicId: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    userId: string | undefined;
    action: string | undefined;
    resource: string | undefined;
    page: number;
    limit: number;
  }):
    | { items: ActivityLog[]; meta: any }
    | PromiseLike<{ items: ActivityLog[]; meta: any }>;
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
