import { Module } from '@nestjs/common';
import { RolesController } from '../../presentation/rest/roles/roles.controller';
import { GetAllRolesHandler } from '../../usecases/roles/queries/get_all_roles/get_all_roles.handler';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [
    // Use Case Handlers
    GetAllRolesHandler,
  ],
  exports: [GetAllRolesHandler],
})
export class RolesModule {}
