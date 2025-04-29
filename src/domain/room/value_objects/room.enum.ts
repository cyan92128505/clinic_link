import { EnumUtils } from 'src/utils/enum_utils';

export enum RoomStatus {
  OPEN = 'OPEN',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
}

export const RoomStatusUtils = new EnumUtils<RoomStatus>(RoomStatus);
