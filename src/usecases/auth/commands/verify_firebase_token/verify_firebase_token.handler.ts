import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BaseCommandUseCase } from '../../../common/base/base_usecase';
import { VerifyFirebaseTokenCommand } from './verify_firebase_token.command';
import { VerifyFirebaseTokenResponse } from './verify_firebase_token.response';
import { AuthService } from '../../../../infrastructure/auth/services/auth.service';
import { PrismaService } from '../../../../infrastructure/common/database/prisma/prisma.service';

@Injectable()
@CommandHandler(VerifyFirebaseTokenCommand)
export class VerifyFirebaseTokenHandler
  extends BaseCommandUseCase<
    VerifyFirebaseTokenCommand,
    VerifyFirebaseTokenResponse
  >
  implements ICommandHandler<VerifyFirebaseTokenCommand>
{
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
  ) {
    super();
  }

  /**
   * Execute verify Firebase token command
   * @param command Command with Firebase ID token
   * @returns Response with JWT token and user info
   */
  async execute(
    command: VerifyFirebaseTokenCommand,
  ): Promise<VerifyFirebaseTokenResponse> {
    // Verify Firebase token
    const decodedToken = await this.authService.verifyFirebaseToken(
      command.token,
    );

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    // Check if user exists by Firebase UID or email
    let user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: decodedToken.email }],
      },
      include: {
        clinics: {
          include: {
            clinic: true,
          },
        },
      },
    });

    let isNewUser = false;

    // If user doesn't exist, create a new one
    if (!user) {
      isNewUser = true;

      // Generate a random password for Firebase users
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword =
        await this.authService.hashPassword(randomPassword);

      const userName =
        `${decodedToken.name}` || decodedToken.email?.split('@')[0] || '';

      // Create new user
      user = await this.prismaService.user.create({
        data: {
          email: decodedToken.email || null,
          name: userName,
          password: hashedPassword, // Store hashed random password
          lastLoginAt: new Date(),
        },
        include: {
          clinics: {
            include: {
              clinic: true,
            },
          },
        },
      });
    } else {
      // Update last login time
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Generate JWT token
    const token = await this.authService.generateToken(user);

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
      isNewUser,
    };
  }
}
