import { Module } from '@nestjs/common';
import { ClinicUsersController } from '../../presentation/rest/clinic_users/clinic_users.controller';
import { AddUserToClinicHandler } from '../../usecases/user_clinics/commands/add_user_to_clinic/add_user_to_clinic.handler';
import { UpdateUserRoleHandler } from '../../usecases/user_clinics/commands/update_user_role/update_user_role.handler';
import { RemoveUserFromClinicHandler } from '../../usecases/user_clinics/commands/remove_user_from_clinic/remove_user_from_clinic.handler';
import { GetClinicUsersHandler } from '../../usecases/user_clinics/queries/get_clinic_users/get_clinic_users.handler';
import { PrismaUserRepository } from '../../infrastructure/repositories/user/prisma.user.repository';
import { PrismaClinicRepository } from '../../infrastructure/repositories/clinic/prisma.clinic.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClinicUsersController],
  providers: [
    // Use Case Handlers
    AddUserToClinicHandler,
    UpdateUserRoleHandler,
    RemoveUserFromClinicHandler,
    GetClinicUsersHandler,

    // Repositories
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IClinicRepository',
      useClass: PrismaClinicRepository,
    },
  ],
  exports: [
    AddUserToClinicHandler,
    UpdateUserRoleHandler,
    RemoveUserFromClinicHandler,
    GetClinicUsersHandler,
  ],
})
export class ClinicUsersModule {}
