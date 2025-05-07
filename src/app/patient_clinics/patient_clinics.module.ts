import { Module } from '@nestjs/common';
import { PatientClinicsController } from '../../presentation/rest/patient_clinics/patient_clinics.controller';
import { LinkPatientToClinicHandler } from '../../usecases/patient_clinics/commands/link_patient_to_clinic/link_patient_to_clinic.handler';
import { GetPatientClinicsHandler } from '../../usecases/patient_clinics/queries/get_patient_clinics/get_patient_clinics.handler';
import { GetPatientClinicInfoHandler } from '../../usecases/patient_clinics/queries/get_patient_clinic_info/get_patient_clinic_info.handler';
import { PrismaPatientClinicRepository } from '../../infrastructure/repositories/patient/prisma.patient-clinic.repository';
import { PrismaClinicRepository } from '../../infrastructure/repositories/clinic/prisma.clinic.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';
import { PrismaPatientRepository } from 'src/infrastructure/repositories/patient/prisma.patient.repository';
import { PrismaAppointmentRepository } from 'src/infrastructure/repositories/appointment/prisma.appointment.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatientClinicsController],
  providers: [
    // Use Case Handlers
    LinkPatientToClinicHandler,
    GetPatientClinicsHandler,
    GetPatientClinicInfoHandler,

    // Repositories
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
    {
      provide: 'IAppointmentRepository',
      useClass: PrismaAppointmentRepository,
    },
  ],
  exports: [
    LinkPatientToClinicHandler,
    GetPatientClinicsHandler,
    GetPatientClinicInfoHandler,
  ],
})
export class PatientClinicsModule {}
