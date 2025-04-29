import { BaseEntity } from 'src/domain/common/entities/base.entity';

export class User extends BaseEntity {
  email: string;
  password: string;
  name: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;

  constructor(props: Partial<User>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
