import { EnumUtils } from 'src/utils/enum_utils';

export enum Role {
  ADMIN = 'ADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  STAFF = 'STAFF',
  RECEPTIONIST = 'RECEPTIONIST',
}

export const RoleUtils = new EnumUtils<Role>(Role);
