import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BaseCommandUseCase } from '../../../common/base/base_usecase';
import { SelectClinicCommand } from './select_clinic.command';
import { SelectClinicResponse } from './select_clinic.response';
import { PrismaService } from '../../../../infrastructure/common/database/prisma/prisma.service';

@Injectable()
@CommandHandler(SelectClinicCommand)
export class SelectClinicHandler
  extends BaseCommandUseCase<SelectClinicCommand, SelectClinicResponse>
  implements ICommandHandler<SelectClinicCommand>
{
  constructor(private prismaService: PrismaService) {
    super();
  }

  /**
   * Execute select clinic command
   * @param command Command with clinic ID and user ID
   * @returns Selected clinic info
   */
  async execute(command: SelectClinicCommand): Promise<SelectClinicResponse> {
    // Check if clinic exists
    const clinic = await this.prismaService.clinic.findUnique({
      where: { id: command.clinicId },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // Check if user has access to this clinic
    const userClinic = await this.prismaService.userClinic.findUnique({
      where: {
        userId_clinicId: {
          userId: command.userId!,
          clinicId: command.clinicId,
        },
      },
    });

    if (!userClinic) {
      throw new ForbiddenException('User does not have access to this clinic');
    }

    // Return selected clinic information
    return {
      clinic: {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email ?? '',
        logo: clinic.logo ?? '',
        role: userClinic.role,
      },
    };
  }
}
