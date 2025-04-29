import { EnumUtils } from 'src/utils/enum_utils';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export const AppointmentStatusUtils = new EnumUtils<AppointmentStatus>(
  AppointmentStatus,
);

export enum AppointmentSource {
  WALK_IN = 'WALK_IN',
  PHONE = 'PHONE',
  ONLINE = 'ONLINE',
  LINE = 'LINE',
  APP = 'APP',
}

export const AppointmentSourceUtils = new EnumUtils<AppointmentSource>(
  AppointmentSource,
);
