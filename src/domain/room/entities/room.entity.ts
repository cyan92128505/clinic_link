import { BaseEntity } from 'src/domain/common/entities/base.entity';
import { RoomStatus } from '../value_objects/room.enum';

export class Room extends BaseEntity {
  clinicId: string;
  name: string;
  description?: string;
  status: RoomStatus;

  constructor(props: Partial<Room>) {
    super({
      id: props.id!,
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.status = props.status || RoomStatus.CLOSED;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
