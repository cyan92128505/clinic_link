import { RoomStatus } from 'src/domain/room/value_objects/room.enum';

// Command for updating a room's status
export class UpdateRoomStatusCommand {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // Room unique identifier
    public readonly roomId: string,

    // New room status
    public readonly status: RoomStatus,

    // Optional: User performing the update (for audit purposes)
    public readonly updatedBy: {
      userId: string;
      userRole: string;
    },
  ) {}
}
