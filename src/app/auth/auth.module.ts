import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../../infrastructure/auth/services/auth.service';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../../infrastructure/auth/strategies/local.strategy';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt_auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from '../../presentation/rest/auth/auth.controller';
import { LoginHandler } from '../../usecases/auth/commands/login/login.handler';
import { RegisterHandler } from '../../usecases/auth/commands/register/register.handler';
import { VerifyFirebaseTokenHandler } from '../../usecases/auth/commands/verify_firebase_token/verify_firebase_token.handler';
import { GetCurrentUserHandler } from '../../usecases/auth/queries/get_current_user/get_current_user.handler';
import { SelectClinicHandler } from '../../usecases/auth/commands/select_clinic/select_clinic.handler';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Services
    AuthService,

    // Strategies
    JwtStrategy,
    LocalStrategy,

    // Use cases
    LoginHandler,
    RegisterHandler,
    VerifyFirebaseTokenHandler,
    GetCurrentUserHandler,
    SelectClinicHandler,

    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
