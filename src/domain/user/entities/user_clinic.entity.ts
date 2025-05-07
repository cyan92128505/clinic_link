import { Role } from '../value_objects/role.enum';

/**
 * UserClinic join entity - represents relationship between users and clinics
 */
export class UserClinic {
  userId!: string;
  clinicId!: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<UserClinic>) {
    Object.assign(this, props);

    // Set default values if not provided
    this.role = props.role || Role.STAFF;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
