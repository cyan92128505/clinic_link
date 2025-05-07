import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRoomStatusCommand } from './update_room_status.command';
import { IRoomRepository } from 'src/domain/room/interfaces/room.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Role } from 'src/domain/user/value_objects/role.enum';

@Injectable()
@CommandHandler(UpdateRoomStatusCommand)
export class UpdateRoomStatusHandler
  implements ICommandHandler<UpdateRoomStatusCommand>
{
  constructor(
    @Inject('IRoomRepository')
    private readonly roomRepository: IRoomRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(command: UpdateRoomStatusCommand) {
    const { clinicId, roomId, status, updatedBy } = command;

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Verify room exists and belongs to the clinic
    const room = await this.roomRepository.findById(roomId, clinicId);
    if (!room) {
      throw new Error('Room not found in the specified clinic');
    }

    // Access control
    const allowedRoles = [
      Role.ADMIN,
      Role.CLINIC_ADMIN,
      Role.DOCTOR,
      Role.NURSE,
      Role.RECEPTIONIST,
    ];

    if (!allowedRoles.includes(updatedBy.userRole as Role)) {
      throw new UnauthorizedException(
        'Insufficient permissions to update room status',
      );
    }

    // Validate status change
    if (status === room.status) {
      // No actual change in status
      return {
        roomId,
        clinicId,
        previousStatus: room.status,
        newStatus: status,
        updated: false,
      };
    }

    // Update room status
    await this.roomRepository.update(roomId, clinicId, {
      status,
      updatedAt: new Date(),
    });

    return {
      roomId,
      clinicId,
      previousStatus: room.status,
      newStatus: status,
      updated: true,
    };
  }
}
