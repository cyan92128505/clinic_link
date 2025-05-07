import { Module } from '@nestjs/common';
import { PatientsController } from '../../presentation/rest/patients/patients.controller';
import { GetClinicPatientsHandler } from '../../usecases/patients/queries/get_clinic_patients/get_clinic_patients.handler';
import { GetClinicPatientByIdHandler } from '../../usecases/patients/queries/get_clinic_patient_by_id/get_clinic_patient_by_id.handler';
import { CreateClinicPatientHandler } from '../../usecases/patients/commands/create_clinic_patient/create_clinic_patient.handler';
import { UpdateClinicPatientHandler } from '../../usecases/patients/commands/update_clinic_patient/update_clinic_patient.handler';
import { PrismaPatientRepository } from '../../infrastructure/repositories/patient/prisma.patient.repository';
import { PrismaPatientClinicRepository } from '../../infrastructure/repositories/patient/prisma.patient-clinic.repository';
import { PrismaClinicRepository } from '../../infrastructure/repositories/clinic/prisma.clinic.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PatientsController],
  providers: [
    // Use Case Handlers
    GetClinicPatientsHandler,
    GetClinicPatientByIdHandler,
    CreateClinicPatientHandler,
    UpdateClinicPatientHandler,

    // Repositories
    {
      provide: 'IPatientRepository',
      useClass: PrismaPatientRepository,
    },
    {
      provide: 'IPatientClinicRepository',
      useClass: PrismaPatientClinicRepository,
    },
    {
      provide: 'IClinicRepository',
      useClass: PrismaClinicRepository,
    },
  ],
  exports: [
    GetClinicPatientsHandler,
    GetClinicPatientByIdHandler,
    CreateClinicPatientHandler,
    UpdateClinicPatientHandler,
  ],
})
export class PatientsModule {}
