import { Module } from '@nestjs/common';
import { StatsController } from '../../presentation/rest/stats/stats.controller';
import { GetDashboardStatsHandler } from '../../usecases/stats/queries/get_dashboard_stats/get_dashboard_stats.handler';
import { PrismaAppointmentRepository } from '../../infrastructure/repositories/appointment/prisma.appointment.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';
import { PrismaPatientRepository } from 'src/infrastructure/repositories/patient/prisma.patient.repository';
import { PrismaPatientClinicRepository } from 'src/infrastructure/repositories/patient/prisma.patient-clinic.repository';
import { PrismaClinicRepository } from 'src/infrastructure/repositories/clinic/prisma.clinic.repository';

@Module({
  imports: [PrismaModule],
  controllers: [StatsController],
  providers: [
    // Use Case Handlers
    GetDashboardStatsHandler,

    // Repositories
    {
      provide: 'IAppointmentRepository',
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: 'IPatientClinicRepository',
      useClass: PrismaPatientClinicRepository,
    },
    {
      provide: 'IClinicRepository',
      useClass: PrismaClinicRepository,
    },
    {
      provide: 'IPatientRepository',
      useClass: PrismaPatientRepository,
    },
  ],
  exports: [GetDashboardStatsHandler],
})
export class StatsModule {}
