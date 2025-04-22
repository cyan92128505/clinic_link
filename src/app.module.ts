import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/common/database/prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
// import { UsersModule } from './app/users/users.module';
// import { ClinicsModule } from './app/clinics/clinics.module';
// import { PatientsModule } from './app/patients/patients.module';
// import { AppointmentsModule } from './app/appointments/appointments.module';
// import { DoctorsModule } from './app/doctors/doctors.module';
// import { RoomsModule } from './app/rooms/rooms.module';
// import { DepartmentsModule } from './app/departments/departments.module';
// import { ActivityLogsModule } from './app/activity-logs/activity-logs.module';
import { MqttModule } from './infrastructure/common/mqtt/mqtt.module';

@Module({
  imports: [
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
    // UsersModule,
    // ClinicsModule,
    // PatientsModule,
    // AppointmentsModule,
    // DoctorsModule,
    // RoomsModule,
    // DepartmentsModule,
    // ActivityLogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
