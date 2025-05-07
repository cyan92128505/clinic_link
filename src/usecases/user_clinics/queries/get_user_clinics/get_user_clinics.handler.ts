import {
  Inject,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserClinicsQuery } from './get_user_clinics.query';
import { IUserRepository } from 'src/domain/user/interfaces/user.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Role, RoleUtils } from 'src/domain/user/value_objects/role.enum';
import { Clinic } from 'src/domain/clinic/entities/clinic.entity';

@Injectable()
@QueryHandler(GetUserClinicsQuery)
export class GetUserClinicsHandler
  implements IQueryHandler<GetUserClinicsQuery>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(query: GetUserClinicsQuery) {
    const { userId, requestedBy, roles, includeDetails = false } = query;

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Access control
    // Users can always see their own clinics
    // Admins can see any user's clinics

    const userRole =
      RoleUtils.fromString(requestedBy.userRole) ?? Role.RECEPTIONIST;

    if (requestedBy.userId !== userId && userRole !== Role.ADMIN) {
      throw new UnauthorizedException(
        'Insufficient permissions to view user clinics',
      );
    }

    // Fetch all clinics for the user
    const userClinics = await this.userRepository.findByClinic(userId);

    // Filter clinics by roles if specified
    const filteredClinics = roles
      ? userClinics.filter((clinic) =>
          roles.includes(
            userClinics.find((uc) => uc.id === clinic.id)?.id as Role,
          ),
        )
      : userClinics;

    // If additional details are requested, fetch full clinic information
    let clinicsWithDetails: (Clinic | null)[] = [];
    if (includeDetails) {
      clinicsWithDetails = await Promise.all(
        filteredClinics.map(async (clinic) => {
          const fullClinicDetails = await this.clinicRepository.findById(
            clinic.id,
          );
          return fullClinicDetails;
        }),
      );
    }

    return {
      userId,
      clinics: includeDetails ? clinicsWithDetails : filteredClinics,
    };
  }
}
