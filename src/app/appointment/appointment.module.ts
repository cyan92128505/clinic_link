import { Module } from '@nestjs/common';
import { AppointmentController } from '../../presentation/rest/appointment/appointment.controller';
import { GetAppointmentsHandler } from '../../usecases/appointment/queries/get_appointments/get_appointments.handler';
import { CreateAppointmentHandler } from '../../usecases/appointment/commands/create_appointment/create_appointment.handler';
import { UpdateAppointmentHandler } from '../../usecases/appointment/commands/update_appointment/update_appointment.handler';
import { PrismaAppointmentRepository } from '../../infrastructure/repositories/appointment/prisma.appointment.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentController],
  providers: [
    // Use Case Handlers
    GetAppointmentsHandler,
    CreateAppointmentHandler,
    UpdateAppointmentHandler,

    // Repositories
    {
      provide: 'IAppointmentRepository',
      useClass: PrismaAppointmentRepository,
    },
  ],
  exports: [
    GetAppointmentsHandler,
    CreateAppointmentHandler,
    UpdateAppointmentHandler,
  ],
})
export class AppointmentModule {}
