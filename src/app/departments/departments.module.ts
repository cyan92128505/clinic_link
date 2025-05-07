import { Module } from '@nestjs/common';
import { DepartmentsController } from '../../presentation/rest/departments/departments.controller';
import { GetDepartmentsHandler } from '../../usecases/departments/queries/get_departments/get_departments.handler';
import { PrismaDepartmentRepository } from '../../infrastructure/repositories/department/prisma.department.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';
import { PrismaClinicRepository } from 'src/infrastructure/repositories/clinic/prisma.clinic.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentsController],
  providers: [
    // Use Case Handlers
    GetDepartmentsHandler,

    // Repositories
    {
      provide: 'IDepartmentRepository',
      useClass: PrismaDepartmentRepository,
    },
    {
      provide: 'IClinicRepository',
      useClass: PrismaClinicRepository,
    },
  ],
  exports: [GetDepartmentsHandler],
})
export class DepartmentsModule {}
