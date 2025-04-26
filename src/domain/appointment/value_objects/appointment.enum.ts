export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentSource {
  WALK_IN = 'WALK_IN',
  PHONE = 'PHONE',
  ONLINE = 'ONLINE',
  LINE = 'LINE',
  APP = 'APP',
}
