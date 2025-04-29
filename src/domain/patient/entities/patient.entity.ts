import { BaseEntity } from 'src/domain/common/entities/base.entity';
import { Gender } from '../value_objects/gender.enum';

export class Patient extends BaseEntity {
  clinicId: string;
  nationalId?: string;
  name: string;
  birthDate?: Date;
  gender?: Gender;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: Record<string, any>;
  note?: string;

  constructor(props: Partial<Patient>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
