import { BaseEntity } from 'src/domain/common/entities/base.entity';

export class Clinic extends BaseEntity {
  name: string;
  address: string;
  phone: string;
  email?: string;
  logo?: string;
  settings?: Record<string, any>;

  constructor(props: Partial<Clinic>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
