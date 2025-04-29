import { BaseEntity } from 'src/domain/common/entities/base.entity';

export class Doctor extends BaseEntity {
  clinicId: string;
  departmentId: string;
  userId?: string;
  name: string;
  title?: string;
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
  avatar?: string;
  scheduleData?: Record<string, any>;

  constructor(props: Partial<Doctor>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
