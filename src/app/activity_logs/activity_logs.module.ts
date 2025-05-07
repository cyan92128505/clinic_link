import { Module } from '@nestjs/common';
import { ActivityLogsController } from '../../presentation/rest/activity_logs/activity_logs.controller';
import { GetActivityLogsHandler } from '../../usecases/activity_logs/queries/get_activity_logs/get_activity_logs.handler';
import { PrismaActivityLogRepository } from '../../infrastructure/repositories/activity_log/prisma.activity_log.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';
import { PrismaUserRepository } from 'src/infrastructure/repositories/user/prisma.user.repository';
import { PrismaClinicRepository } from 'src/infrastructure/repositories/clinic/prisma.clinic.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityLogsController],
  providers: [
    // Use Case Handlers
    GetActivityLogsHandler,

    // Repositories
    {
      provide: 'IActivityLogRepository',
      useClass: PrismaActivityLogRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IClinicRepository',
      useClass: PrismaClinicRepository,
    },
  ],
  exports: [GetActivityLogsHandler],
})
export class ActivityLogsModule {}
