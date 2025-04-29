import { BaseEntity } from 'src/domain/common/entities/base.entity';

export class ActivityLog extends BaseEntity {
  clinicId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;

  constructor(props: Partial<ActivityLog>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.createdAt = props.createdAt || new Date();
  }
}
