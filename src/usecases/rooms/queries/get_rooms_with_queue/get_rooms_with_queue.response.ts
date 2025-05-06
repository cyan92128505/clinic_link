import { Room } from 'src/domain/room/entities/room.entity';
import { Appointment } from 'src/domain/appointment/entities/appointment.entity';
import { RoomStatus } from 'src/domain/room/value_objects/room.enum';
import { AppointmentStatus } from 'src/domain/appointment/value_objects/appointment.enum';
import { AppointmentSource } from 'src/domain/appointment/value_objects/appointment.enum';

// Response DTO for retrieving rooms with their queue information
export class GetRoomsWithQueueResponse {
  // Rooms with their queue information
  rooms: Array<{
    room: Room;
    queue: Appointment[];
    queueLength: number;
  }>;

  // Clinic ID
  clinicId: string;

  // Date of the queue
  date: Date;

  constructor(data: {
    rooms: Array<{
      room: Room;
      queue: Appointment[];
      queueLength: number;
    }>;
    clinicId: string;
    date: Date;
  }) {
    this.rooms = data.rooms;
    this.clinicId = data.clinicId;
    this.date = data.date;
  }

  // Method to create a public response with basic information
  toPublicResponse() {
    return {
      clinicId: this.clinicId,
      date: this.date,
      rooms: this.rooms.map(({ room, queue, queueLength }) => ({
        roomId: room.id,
        name: room.name,
        description: room.description,
        status: room.status,
        queueLength,
        nextAppointment: this.getNextAppointmentInfo(queue),
      })),
    };
  }

  // Method to create a detailed response for authorized users
  toDetailedResponse() {
    return {
      clinicId: this.clinicId,
      date: this.date,
      rooms: this.rooms.map(({ room, queue, queueLength }) => ({
        // Basic room information
        roomId: room.id,
        name: room.name,
        description: room.description,
        status: room.status,

        // Queue information
        queueLength,
        queue: queue.map((appointment) => ({
          appointmentId: appointment.id,
          appointmentNumber: appointment.appointmentNumber,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          roomId: appointment.roomId,
          appointmentTime: appointment.appointmentTime,
          checkinTime: appointment.checkinTime,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          source: appointment.source,
          note: appointment.note,
        })),

        // Next appointment details
        nextAppointment: this.getNextAppointmentInfo(queue),
      })),
    };
  }

  // Helper method to get next appointment information
  private getNextAppointmentInfo(queue: Appointment[]): {
    appointmentId?: string;
    appointmentNumber?: number;
    appointmentTime?: Date;
    status?: AppointmentStatus;
    source?: AppointmentSource;
  } | null {
    if (queue.length === 0) return null;

    const nextAppointment = queue[0];
    return {
      appointmentId: nextAppointment.id,
      appointmentNumber: nextAppointment.appointmentNumber,
      appointmentTime: nextAppointment.appointmentTime,
      status: nextAppointment.status,
      source: nextAppointment.source,
    };
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    rooms: Array<{
      room: Room;
      queue: Appointment[];
      queueLength: number;
    }>;
    clinicId: string;
    date: Date;
  }): GetRoomsWithQueueResponse {
    return new GetRoomsWithQueueResponse(result);
  }
}
