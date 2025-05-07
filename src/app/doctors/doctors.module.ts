import { Module } from '@nestjs/common';
import { DoctorsController } from '../../presentation/rest/doctors/doctors.controller';
import { GetDoctorsHandler } from '../../usecases/doctors/queries/get_doctors/get_doctors.handler';
import { PrismaDoctorRepository } from '../../infrastructure/repositories/doctor/prisma.doctor.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';
import { PrismaClinicRepository } from 'src/infrastructure/repositories/clinic/prisma.clinic.repository';
import { PrismaDepartmentRepository } from 'src/infrastructure/repositories/department/prisma.department.repository';
import { PrismaRoomRepository } from 'src/infrastructure/repositories/room/prisma.room.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DoctorsController],
  providers: [
    // Use Case Handlers
    GetDoctorsHandler,

    // Repositories
    {
      provide: 'IDoctorRepository',
      useClass: PrismaDoctorRepository,
    },
    {
      provide: 'IClinicRepository',
      useClass: PrismaClinicRepository,
    },
    {
      provide: 'IDepartmentRepository',
      useClass: PrismaDepartmentRepository,
    },
    {
      provide: 'IRoomRepository',
      useClass: PrismaRoomRepository,
    },
  ],
  exports: [GetDoctorsHandler],
})
export class DoctorsModule {}
