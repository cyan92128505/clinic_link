import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BaseCommandUseCase } from '../../../common/base/base_usecase';
import { RegisterCommand } from './register.command';
import { RegisterResponse } from './register.response';
import { AuthService } from '../../../../infrastructure/auth/services/auth.service';
import { PrismaService } from '../../../../infrastructure/common/database/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
@CommandHandler(RegisterCommand)
export class RegisterHandler
  extends BaseCommandUseCase<RegisterCommand, RegisterResponse>
  implements ICommandHandler<RegisterCommand>
{
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
  ) {
    super();
  }

  /**
   * Execute register command
   * @param command Register command with user and optional clinic info
   * @returns Register response with token and user info
   */
  async execute(command: RegisterCommand): Promise<RegisterResponse> {
    // Check if user with this email already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: command.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await this.authService.hashPassword(
      command.password,
    );

    // Begin transaction
    const result = await this.prismaService.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: command.email,
          password: hashedPassword,
          name: command.name,
          phone: command.phone,
          lastLoginAt: new Date(),
        },
      });

      // If clinic info is provided, create a new clinic
      if (command.clinicName) {
        if (!command.clinicAddress || !command.clinicPhone) {
          throw new BadRequestException(
            'Clinic address and phone are required when creating a clinic',
          );
        }

        // Create clinic
        const clinic = await prisma.clinic.create({
          data: {
            name: command.clinicName,
            address: command.clinicAddress,
            phone: command.clinicPhone,
            users: {
              create: {
                userId: user.id,
                role: Role.CLINIC_ADMIN, // The creator is automatically a clinic admin
              },
            },
          },
          include: {
            users: true,
          },
        });

        // Return user with clinic info
        return {
          user: {
            ...user,
            clinics: [
              {
                clinicId: clinic.id,
                clinic: clinic,
                role: Role.CLINIC_ADMIN,
              },
            ],
          },
        };
      }

      // Return user without clinic info
      return {
        user: {
          ...user,
          clinics: [],
        },
      };
    });

    // Generate token
    const token = await this.authService.generateToken(result.user);

    // Return response
    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        clinics: result.user.clinics.map((uc) => ({
          id: uc.clinicId,
          name: uc.clinic.name,
          role: uc.role,
        })),
      },
    };
  }
}
