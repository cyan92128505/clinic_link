import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicUsersQuery } from './get_clinic_users.query';
import { IUserRepository } from 'src/domain/user/interfaces/user.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Role } from 'src/domain/user/value_objects/role.enum';
import { User } from 'src/domain/user/entities/user.entity';

@Injectable()
@QueryHandler(GetClinicUsersQuery)
export class GetClinicUsersHandler
  implements IQueryHandler<GetClinicUsersQuery>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(query: GetClinicUsersQuery) {
    const {
      clinicId,
      requestedBy,
      roles,
      pagination = { page: 1, limit: 20 },
      search,
    } = query;

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Access control
    const allowedRoles = [Role.ADMIN, Role.CLINIC_ADMIN, Role.DOCTOR];

    if (!allowedRoles.includes(requestedBy.userRole as Role)) {
      throw new UnauthorizedException(
        'Insufficient permissions to view clinic users',
      );
    }

    // Additional check for Clinic Admin: can only view their own clinic
    if (requestedBy.userRole === Role.CLINIC_ADMIN) {
      const adminClinics = await this.userRepository.findByClinic(clinicId);
      const isAdminOfClinic = adminClinics.some(
        (adminUser) => adminUser.id === requestedBy.userId,
      );

      if (!isAdminOfClinic) {
        throw new UnauthorizedException(
          'You can only view users in your own clinic',
        );
      }
    }

    // Fetch users in the clinic
    const clinicUsers = await this.userRepository.findByClinic(clinicId);

    // Filter by roles if specified
    let filteredUsers = roles
      ? clinicUsers.filter((user) =>
          roles.includes(
            clinicUsers.find((cu) => cu.id === user.id)?.id as Role,
          ),
        )
      : clinicUsers;

    // Optional search filtering
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm),
      );
    }

    // Pagination
    const { page = 1, limit = 20 } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
      clinicId,
    };
  }
}
