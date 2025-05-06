import { ActivityLog } from '../../../../domain/activity_log/entities/activity_log.entity';
import { PaginationMeta } from '../../../common/dtos/pagination.dto';

export class ActivityLogDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date | undefined;

  constructor(activityLog: ActivityLog, userName: string, userEmail: string) {
    this.id = activityLog.id;
    this.userId = activityLog.userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.action = activityLog.action;
    this.resource = activityLog.resource;
    this.resourceId = activityLog.resourceId;
    this.details = activityLog.details;
    this.ipAddress = activityLog.ipAddress;
    this.userAgent = activityLog.userAgent;
    this.createdAt = activityLog.createdAt;
  }
}

export class GetActivityLogsResponse {
  data: ActivityLogDto[];
  meta: PaginationMeta;

  constructor(activityLogs: ActivityLogDto[], meta: PaginationMeta) {
    this.data = activityLogs;
    this.meta = meta;
  }
}
