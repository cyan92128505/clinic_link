import { Module } from '@nestjs/common';
import { PrismaUserRepository } from '../../infrastructure/repositories/user/prisma.user.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    // Repositories
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: [
    // Repositories
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
})
export class UserModule {}
