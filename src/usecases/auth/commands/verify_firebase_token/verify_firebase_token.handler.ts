import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BaseCommandUseCase } from '../../../common/base/base_usecase';
import { VerifyFirebaseTokenCommand } from './verify_firebase_token.command';
import { VerifyFirebaseTokenResponse } from './verify_firebase_token.response';
import { AuthService } from '../../../../infrastructure/auth/services/auth.service';
import { PrismaService } from '../../../../infrastructure/common/database/prisma/prisma.service';
import { User } from '../../../../domain/user/entities/user.entity';

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

    // Email is required for our users
    if (!decodedToken.email) {
      throw new UnauthorizedException('Email is required for authentication');
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
        `${decodedToken.name}` || decodedToken.email.split('@')[0] || '';

      // Create new user with empty clinics array
      user = await this.prismaService.user.create({
        data: {
          email: decodedToken.email, // Email is now guaranteed to be non-null
          name: userName,
          password: hashedPassword, // Store hashed random password
          lastLoginAt: new Date(),
          // Create empty clinics relationship
          clinics: {
            create: [],
          },
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

    // At this point, we guarantee user is not null
    if (!user) {
      throw new Error('Failed to create or find user');
    }

    // Convert Prisma user to domain User entity if necessary
    // or make sure your authService can handle the Prisma user type
    const domainUser = new User({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt || undefined,
      // clinics 欄位可選，這裡可以留空或進行轉換
    });

    // Generate JWT token
    const token = await this.authService.generateToken(domainUser);

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
