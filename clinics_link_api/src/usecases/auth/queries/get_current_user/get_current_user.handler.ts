import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseQueryUseCase } from '../../../common/base/base_usecase';
import { GetCurrentUserQuery } from './get_current_user.query';
import { GetCurrentUserResponse } from './get_current_user.response';
import { PrismaService } from '../../../../infrastructure/common/database/prisma/prisma.service';

@Injectable()
export class GetCurrentUserHandler extends BaseQueryUseCase<
  GetCurrentUserQuery,
  GetCurrentUserResponse
> {
  constructor(private prismaService: PrismaService) {
    super();
  }

  /**
   * Execute get current user query
   * @param query Query with user ID
   * @returns Current user info
   */
  async execute(query: GetCurrentUserQuery): Promise<GetCurrentUserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id: query.userId },
      include: {
        clinics: {
          include: {
            clinic: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Transform the data to match the response structure
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone ?? '',
      avatar: user.avatar ?? '',
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ?? new Date(),
      clinics: user.clinics.map((uc) => ({
        id: uc.clinicId,
        name: uc.clinic.name,
        role: uc.role,
      })),
      createdAt: user.createdAt,
    };
  }
}
