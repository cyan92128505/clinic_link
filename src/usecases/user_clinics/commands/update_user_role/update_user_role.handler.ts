import {
  Inject,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserRoleCommand } from './update_user_role.command';
import { IUserRepository } from 'src/domain/user/interfaces/user.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Role } from 'src/domain/user/value_objects/role.enum';

@Injectable()
@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler
  implements ICommandHandler<UpdateUserRoleCommand>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(command: UpdateUserRoleCommand) {
    const { clinicId, userId, newRole, updatedBy } = command;

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch users in the clinic to check roles and permissions
    const clinicUsers = await this.userRepository.findByClinic(clinicId);

    // Check if the user is actually a member of the clinic
    const userInClinic = clinicUsers.find((u) => u.id === userId);
    if (!userInClinic) {
      throw new NotFoundException('User is not a member of this clinic');
    }

    // Access control
    const allowedRoles = [Role.ADMIN, Role.CLINIC_ADMIN];

    // Check if the user performing the update has sufficient permissions
    const updatingUser = clinicUsers.find((u) => u.id === updatedBy.userId);
    if (!updatingUser || !allowedRoles.includes(updatedBy.userRole as Role)) {
      throw new UnauthorizedException(
        'Insufficient permissions to update user role',
      );
    }

    // Additional check for Clinic Admin: can only manage their own clinic
    if (updatedBy.userRole === Role.CLINIC_ADMIN) {
      const isAdminOfClinic = clinicUsers.some(
        (adminUser) => adminUser.id === updatedBy.userId,
      );

      if (!isAdminOfClinic) {
        throw new UnauthorizedException(
          'You can only update roles in your own clinic',
        );
      }
    }

    // Prevent removing the last admin from the clinic
    const adminRoles = [Role.ADMIN, Role.CLINIC_ADMIN];
    const currentAdmins = clinicUsers.filter((u) =>
      adminRoles.includes(clinicUsers.find((cu) => cu.id === u.id)?.id as Role),
    );

    // If the user being updated is currently an admin, ensure it's not the last one
    const isCurrentUserAdmin = adminRoles.includes(
      clinicUsers.find((cu) => cu.id === userId)?.id as Role,
    );

    if (
      isCurrentUserAdmin &&
      currentAdmins.length <= 1 &&
      newRole !== Role.ADMIN &&
      newRole !== Role.CLINIC_ADMIN
    ) {
      throw new ConflictException(
        'Cannot remove the last admin from the clinic',
      );
    }

    // Update user's role in the clinic
    const updatedUserClinic = await this.userRepository.updateClinicRole(
      userId,
      clinicId,
      newRole,
    );

    return {
      userId,
      clinicId,
      previousRole: updatedUserClinic.role,
      newRole,
    };
  }
}
