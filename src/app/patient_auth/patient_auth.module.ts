import { Module } from '@nestjs/common';
import { PatientAuthController } from '../../presentation/rest/patient_auth/patient_auth.controller';
import { RegisterPatientHandler } from '../../usecases/patients/commands/register_patient/register_patient.handler';
import { VerifyPatientTokenHandler } from '../../usecases/patients/commands/verify_patient_token/verify_patient_token.handler';
import { GetPatientProfileHandler } from '../../usecases/patients/queries/get_patient_profile/get_patient_profile.handler';
import { PrismaPatientRepository } from '../../infrastructure/repositories/patient/prisma.patient.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';
import { PatientFirebaseStrategy } from '../../infrastructure/auth/strategies/patient_firebase.strategy';
import { FirebaseAdminService } from 'src/infrastructure/auth/services/firebase_admin.service';
import { PrismaPatientClinicRepository } from 'src/infrastructure/repositories/patient/prisma.patient-clinic.repository';
import { PrismaClinicRepository } from 'src/infrastructure/repositories/clinic/prisma.clinic.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatientAuthController],
  providers: [
    // Use Case Handlers
    RegisterPatientHandler,
    VerifyPatientTokenHandler,
    GetPatientProfileHandler,

    // Strategy
    PatientFirebaseStrategy,

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
    {
      provide: 'IFirebaseAdminService',
      useClass: FirebaseAdminService,
    },
  ],
  exports: [
    RegisterPatientHandler,
    VerifyPatientTokenHandler,
    GetPatientProfileHandler,
  ],
})
export class PatientAuthModule {}
