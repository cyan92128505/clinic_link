import { RoomStatus } from 'src/domain/room/value_objects/room.enum';
import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';

// Query to retrieve rooms with their queue information
export class GetRoomsWithQueueQuery {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // Optional: Filter by room status
    public readonly status?: RoomStatus,

    // Optional: Filter by doctor
    public readonly doctorId?: string,

    // Optional: Specify appointment statuses to include in queue
    public readonly appointmentStatus?: AppointmentStatus,

    // Optional: Specific date to filter appointments
    public readonly date?: Date,

    // Optional: User requesting the information (for access control)
    public readonly requestedBy?: {
      userId: string;
      userRole: string;
    },
  ) {}
}
