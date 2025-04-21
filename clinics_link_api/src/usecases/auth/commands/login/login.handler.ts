import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseCommandUseCase } from '../../../common/base/base_usecase';
import { LoginCommand } from './login.command';
import { LoginResponse } from './login.response';
import { AuthService } from '../../../../infrastructure/auth/services/auth.service';
import { PrismaService } from '../../../../infrastructure/common/database/prisma/prisma.service';

@Injectable()
export class LoginHandler extends BaseCommandUseCase<
  LoginCommand,
  LoginResponse
> {
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
    const user = await this.authService.validateUser(
      command.email,
      command.password,
    );

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

    // Return token and user info
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        clinics: user.clinics.map((uc) => ({
          id: uc.clinicId,
          name: uc.clinic.name,
          role: uc.role,
        })),
      },
    };
  }
}
