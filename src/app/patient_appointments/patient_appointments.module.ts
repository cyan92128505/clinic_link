import { Module } from '@nestjs/common';
import { PatientAppointmentsController } from '../../presentation/rest/patient_appointments/patient_appointments.controller';
import { GetPatientAppointmentsHandler } from '../../usecases/patient_appointment/queries/get_patient_appointments/get_patient_appointments.handler';
import { GetPatientAppointmentByIdHandler } from '../../usecases/patient_appointment/queries/get_patient_appointment_by_id/get_patient_appointment_by_id.handler';
import { CreatePatientAppointmentHandler } from '../../usecases/patient_appointment/commands/create_patient_appointment/create_patient_appointment.handler';
import { UpdatePatientAppointmentHandler } from '../../usecases/patient_appointment/commands/update_patient_appointment/update_patient_appointment.handler';
import { CancelPatientAppointmentHandler } from '../../usecases/patient_appointment/commands/cancel_patient_appointment/cancel_patient_appointment.handler';
import { PrismaAppointmentRepository } from '../../infrastructure/repositories/appointment/prisma.appointment.repository';
import { PrismaPatientClinicRepository } from '../../infrastructure/repositories/patient/prisma.patient-clinic.repository';
import { PrismaModule } from '../../infrastructure/common/database/prisma/prisma.module';
import { PrismaPatientRepository } from 'src/infrastructure/repositories/patient/prisma.patient.repository';
import { PrismaClinicRepository } from 'src/infrastructure/repositories/clinic/prisma.clinic.repository';
import { CommandBus } from '@nestjs/cqrs';

@Module({
  imports: [PrismaModule],
  controllers: [PatientAppointmentsController],
  providers: [
    // Use Case Handlers
    GetPatientAppointmentsHandler,
    GetPatientAppointmentByIdHandler,
    CreatePatientAppointmentHandler,
    UpdatePatientAppointmentHandler,
    CancelPatientAppointmentHandler,
    CommandBus,

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
      provide: 'IPatientRepository',
      useClass: PrismaPatientRepository,
    },
    {
      provide: 'IClinicRepository',
      useClass: PrismaClinicRepository,
    },
  ],
  exports: [
    GetPatientAppointmentsHandler,
    GetPatientAppointmentByIdHandler,
    CreatePatientAppointmentHandler,
    UpdatePatientAppointmentHandler,
    CancelPatientAppointmentHandler,
  ],
})
export class PatientAppointmentsModule {}
