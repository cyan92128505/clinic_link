import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseCommandUseCase } from '../../../common/base/base_usecase';
import { LoginCommand } from './login.command';
import { LoginResponse } from './login.response';
import { AuthService } from '../../../../infrastructure/auth/services/auth.service';
import { PrismaService } from '../../../../infrastructure/common/database/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Role } from '../../../../domain/user/value_objects/role.enum';

// 定義使用者和使用者診所的介面
interface UserWithClinics {
  id: string;
  email: string;
  name: string;
  clinics: Array<{
    clinicId: string;
    role: Role;
    clinic: {
      name: string;
    };
  }>;
}

// 定義返回的診所資訊介面
interface ClinicInfo {
  id: string;
  name: string;
  role: Role;
}

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler
  extends BaseCommandUseCase<LoginCommand, LoginResponse>
  implements ICommandHandler<LoginCommand>
{
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
  ) {
    super();
  }

  /**
   * Execute login command
   * @param command Login command with email and password
   * @returns Login response with token and user info
   */
  async execute(command: LoginCommand): Promise<LoginResponse> {
    // Validate user credentials
    const user = (await this.authService.validateUser(
      command.email,
      command.password,
    )) as UserWithClinics | null;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.authService.generateToken(user);

    // Update last login timestamp
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Map clinics to return format
    const clinics: ClinicInfo[] = user.clinics.map((uc) => ({
      id: uc.clinicId,
      name: uc.clinic.name,
      role: uc.role,
    }));

    // Return token and user info
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        clinics,
      },
    };
  }
}
