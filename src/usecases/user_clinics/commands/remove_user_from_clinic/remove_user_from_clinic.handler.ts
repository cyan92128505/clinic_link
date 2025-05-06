import {
  Inject,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveUserFromClinicCommand } from './remove_user_from_clinic.command';
import { IUserRepository } from 'src/domain/user/interfaces/user.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Role } from 'src/domain/user/value_objects/role.enum';

@Injectable()
@CommandHandler(RemoveUserFromClinicCommand)
export class RemoveUserFromClinicHandler
  implements ICommandHandler<RemoveUserFromClinicCommand>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(command: RemoveUserFromClinicCommand) {
    const { clinicId, userId, removedBy } = command;

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

    // Fetch users in the clinic to check roles
    const clinicUsers = await this.userRepository.findByClinic(clinicId);

    // Check current user's role (the one performing the removal)
    const removingUser = clinicUsers.find((u) => u.id === removedBy.userId);
    const removingUserRole = removingUser
      ? clinicUsers.find((u) => u.id === removedBy.userId)?.id
      : null;

    // Access control
    const allowedRoles = [Role.ADMIN, Role.CLINIC_ADMIN];

    if (
      !removingUserRole ||
      !allowedRoles.includes(removedBy.userRole as Role)
    ) {
      throw new UnauthorizedException(
        'Insufficient permissions to remove user from clinic',
      );
    }

    // Additional check: Clinic admin can only remove users from their own clinic
    if (removedBy.userRole === Role.CLINIC_ADMIN) {
      const isAdminOfClinic = clinicUsers.some(
        (adminUser) => adminUser.id === removedBy.userId,
      );

      if (!isAdminOfClinic) {
        throw new UnauthorizedException(
          'You can only remove users from your own clinic',
        );
      }
    }

    // Check if user is actually a member of the clinic
    const isUserInClinic = clinicUsers.some(
      (existingUser) => existingUser.id === userId,
    );

    if (!isUserInClinic) {
      throw new NotFoundException('User is not a member of this clinic');
    }

    // Prevent removing the last admin from the clinic
    const adminsInClinic = clinicUsers.filter(
      (u) => u.id !== userId && clinicUsers.find((cu) => cu.id === u.id),
    );

    if (adminsInClinic.length === 0) {
      throw new UnauthorizedException(
        'Cannot remove the last admin from the clinic',
      );
    }

    // Remove user from clinic
    const result = await this.userRepository.removeFromClinic(userId, clinicId);

    return {
      userId,
      clinicId,
      removed: result,
    };
  }
}
