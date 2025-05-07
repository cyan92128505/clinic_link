import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/common/database/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { MqttModule } from './infrastructure/common/mqtt/mqtt.module';
import { HealthModule } from './app/health/health.module';
import { AppController } from './app.controller';
import { LoggingMiddleware } from './infrastructure/common/middleware/logging.middleware';
import { CqrsModule } from '@nestjs/cqrs';
import { AppointmentModule } from './app/appointment/appointment.module';
import { UserModule } from './app/user/user.module';
import { PatientsModule } from './app/patients/patients.module';
import { PatientAuthModule } from './app/patient_auth/patient_auth.module';
import { PatientClinicsModule } from './app/patient_clinics/patient_clinics.module';
import { PatientAppointmentsModule } from './app/patient_appointments/patient_appointments.module';
import { ClinicUsersModule } from './app/clinic_users/clinic_users.module';
import { RoomsModule } from './app/rooms/rooms.module';
import { DepartmentsModule } from './app/departments/departments.module';
import { DoctorsModule } from './app/doctors/doctors.module';
import { StatsModule } from './app/stats/stats.module';
import { ActivityLogsModule } from './app/activity_logs/activity_logs.module';

@Module({
  imports: [
    CqrsModule,
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
    }),

    // Database
    PrismaModule,

    // MQTT
    MqttModule,

    // Application modules
    AuthModule,

    HealthModule,

    AppointmentModule,
    AuthModule,
    HealthModule,
    UserModule,
    PatientsModule,
    PatientAuthModule,
    PatientClinicsModule,
    PatientAppointmentsModule,
    ClinicUsersModule,
    RoomsModule,
    DepartmentsModule,
    DoctorsModule,
    StatsModule,
    ActivityLogsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
