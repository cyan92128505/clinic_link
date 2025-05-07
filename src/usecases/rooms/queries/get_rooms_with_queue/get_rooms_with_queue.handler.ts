import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRoomsWithQueueQuery } from './get_rooms_with_queue.query';
import { IRoomRepository } from 'src/domain/room/interfaces/room.repository.interface';
import { IAppointmentRepository } from 'src/domain/appointment/interfaces/appointment.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { IDoctorRepository } from 'src/domain/doctor/interfaces/doctor.repository.interface';
import { RoomStatus } from 'src/domain/room/value_objects/room.enum';
import { Role } from 'src/domain/user/value_objects/role.enum';

@Injectable()
@QueryHandler(GetRoomsWithQueueQuery)
export class GetRoomsWithQueueHandler
  implements IQueryHandler<GetRoomsWithQueueQuery>
{
  constructor(
    @Inject('IRoomRepository')
    private readonly roomRepository: IRoomRepository,

    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,

    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(query: GetRoomsWithQueueQuery) {
    const {
      clinicId,
      status,
      doctorId,
      appointmentStatus,
      date = new Date(),
      requestedBy,
    } = query;

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Access control
    if (requestedBy) {
      const allowedRoles = [
        Role.ADMIN,
        Role.CLINIC_ADMIN,
        Role.DOCTOR,
        Role.NURSE,
        Role.RECEPTIONIST,
      ];

      if (!allowedRoles.includes(requestedBy.userRole as Role)) {
        throw new UnauthorizedException(
          'Insufficient permissions to access room queue',
        );
      }
    }

    // Prepare room filtering conditions
    const roomConditions: { clinicId: string; status?: RoomStatus } = {
      clinicId,
    };
    if (status) roomConditions.status = status;

    // Fetch rooms based on conditions
    let rooms = await this.roomRepository.findAll(clinicId);

    // Optional doctor-specific room filtering
    if (doctorId) {
      // Verify doctor exists and belongs to the clinic
      const doctor = await this.doctorRepository.findById(doctorId, clinicId);
      if (!doctor) {
        throw new Error('Doctor not found in the specified clinic');
      }

      rooms = await this.roomRepository.findByDoctor(clinicId, doctorId);
    }

    // Fetch queue information for each room
    const roomsWithQueue = await Promise.all(
      rooms.map(async (room) => {
        // Fetch appointments in the room
        const queue = await this.appointmentRepository.findAll(clinicId, {
          roomId: room.id,
          status: appointmentStatus,
          appointmentTime: date, // Assuming the repository can handle date filtering
        });

        // Sort queue by appointment time
        queue.sort(
          (a, b) =>
            (a.appointmentTime?.getTime() || 0) -
            (b.appointmentTime?.getTime() || 0),
        );

        return {
          room,
          queue,
          queueLength: queue.length,
        };
      }),
    );

    return {
      rooms: roomsWithQueue,
      clinicId,
      date,
    };
  }
}
