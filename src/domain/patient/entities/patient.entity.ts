import { BaseEntity } from 'src/domain/common/entities/base.entity';
import { Gender } from '../value_objects/gender.enum';

export class Patient extends BaseEntity {
  firebaseUid?: string;
  nationalId?: string;
  name!: string;
  birthDate?: Date;
  gender?: Gender;
  phone!: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  constructor(props: Partial<Patient>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public getAge(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    let age = today.getFullYear() - this.birthDate.getFullYear();
    const monthDiff = today.getMonth() - this.birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this.birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
