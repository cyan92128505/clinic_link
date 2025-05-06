import { BaseEntity } from 'src/domain/common/entities/base.entity';
import { UserClinic } from './user_clinic.entity';

export class User extends BaseEntity {
  email: string;
  password: string;
  name: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  clinics: UserClinic[] = [];

  constructor(props: Partial<User>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.clinics = props.clinics || [];
  }

  // 查找用戶在特定診所的角色
  getRoleInClinic(clinicId: string): string {
    const clinic = this.clinics.find((c) => c.clinicId === clinicId);
    return clinic?.role || '';
  }
}
