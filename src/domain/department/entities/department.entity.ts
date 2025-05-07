import { BaseEntity } from 'src/domain/common/entities/base.entity';

export class Department extends BaseEntity {
  clinicId!: string;
  name!: string;
  description?: string;
  color?: string;

  constructor(props: Partial<Department>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
