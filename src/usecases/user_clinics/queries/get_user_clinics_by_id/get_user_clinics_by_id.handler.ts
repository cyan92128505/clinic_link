import {
  Inject,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserClinicsByIdQuery } from './get_user_clinics_by_id.query';
import { IUserRepository } from 'src/domain/user/interfaces/user.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Role } from 'src/domain/user/value_objects/role.enum';
import { Clinic } from 'src/domain/clinic/entities/clinic.entity';

@Injectable()
@QueryHandler(GetUserClinicsByIdQuery)
export class GetUserClinicsByIdHandler
  implements IQueryHandler<GetUserClinicsByIdQuery>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(query: GetUserClinicsByIdQuery) {
    const {
      userId,
      requestedBy,
      clinicId,
      roles,
      includeDetails = false,
    } = query;

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Access control
    // Users can always see their own clinics
    // Admins can see any user's clinics
    if (requestedBy.userId !== userId && requestedBy.userRole !== Role.ADMIN) {
      throw new UnauthorizedException(
        'Insufficient permissions to view user clinics',
      );
    }

    // Fetch all clinics for the user
    const userClinics = await this.userRepository.findByClinic(userId);

    // Filter clinics by clinic ID if specified
    let filteredClinics = clinicId
      ? userClinics.filter((clinic) => clinic.id === clinicId)
      : userClinics;

    // Filter clinics by roles if specified
    filteredClinics = roles
      ? filteredClinics.filter((clinic) =>
          roles.includes(
            userClinics.find((uc) => uc.id === clinic.id)?.id as Role,
          ),
        )
      : filteredClinics;

    // If no clinics found after filtering, throw not found error
    if (filteredClinics.length === 0) {
      throw new NotFoundException(
        'No clinics found matching the specified criteria',
      );
    }

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
      clinicId,
      clinics: includeDetails ? clinicsWithDetails : filteredClinics,
    };
  }
}
