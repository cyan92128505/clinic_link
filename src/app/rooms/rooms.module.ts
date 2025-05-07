import { Module } from '@nestjs/common';
import { RoomsController } from '../../presentation/rest/rooms/rooms.controller';
import { GetRoomsWithQueueHandler } from '../../usecases/rooms/queries/get_rooms_with_queue/get_rooms_with_queue.handler';
import { UpdateRoomStatusHandler } from '../../usecases/rooms/commands/update_room_status/update_room_status.handler';
import { PrismaRoomRepository } from '../../infrastructure/repositories/room/prisma.room.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';
import { PrismaAppointmentRepository } from 'src/infrastructure/repositories/appointment/prisma.appointment.repository';
import { PrismaClinicRepository } from 'src/infrastructure/repositories/clinic/prisma.clinic.repository';
import { PrismaDoctorRepository } from 'src/infrastructure/repositories/doctor/prisma.doctor.repository';
import { QueryBus, CommandBus } from '@nestjs/cqrs';

@Module({
  imports: [PrismaModule],
  controllers: [RoomsController],
  providers: [
    // Use Case Handlers
    GetRoomsWithQueueHandler,
    UpdateRoomStatusHandler,
    QueryBus,
    CommandBus,

    // Repositories
    {
      provide: 'IRoomRepository',
      useClass: PrismaRoomRepository,
    },
    {
      provide: 'IAppointmentRepository',
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: 'IClinicRepository',
      useClass: PrismaClinicRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: PrismaDoctorRepository,
    },
  ],
  exports: [GetRoomsWithQueueHandler, UpdateRoomStatusHandler],
})
export class RoomsModule {}
