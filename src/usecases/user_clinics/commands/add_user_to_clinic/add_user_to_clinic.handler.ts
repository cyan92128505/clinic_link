import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddUserToClinicCommand } from './add_user_to_clinic.command';
import { IUserRepository } from 'src/domain/user/interfaces/user.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Role } from 'src/domain/user/value_objects/role.enum';
import { UserClinic } from 'src/domain/user/entities/user_clinic.entity';

@Injectable()
@CommandHandler(AddUserToClinicCommand)
export class AddUserToClinicHandler
  implements ICommandHandler<AddUserToClinicCommand>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(command: AddUserToClinicCommand) {
    const { clinicId, userId, role, addedBy } = command;

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Access control
    const allowedRoles = [Role.ADMIN, Role.CLINIC_ADMIN];

    if (!allowedRoles.includes(addedBy.userRole as Role)) {
      throw new UnauthorizedException(
        'Insufficient permissions to add user to clinic',
      );
    }

    // Additional check: Clinic admin can only add users to their own clinic
    if (addedBy.userRole === Role.CLINIC_ADMIN) {
      const adminClinics = await this.userRepository.findByClinic(clinicId);
      const isAdminOfClinic = adminClinics.some(
        (adminUser) => adminUser.id === addedBy.userId,
      );

      if (!isAdminOfClinic) {
        throw new UnauthorizedException(
          'You can only add users to your own clinic',
        );
      }
    }

    // Check if user is already in the clinic
    const findUserClinics = await this.userRepository.findByClinic(clinicId);
    const isUserAlreadyInClinic = findUserClinics.some(
      (existingUser) => existingUser.id === userId,
    );

    if (isUserAlreadyInClinic) {
      throw new ConflictException('User is already a member of this clinic');
    }

    // Create user-clinic association
    const userClinic = new UserClinic({
      userId,
      clinicId,
      role,
    });

    // Save the association
    const createdUserClinic = await this.userRepository.addToClinic(userClinic);

    return {
      userId,
      clinicId,
      role,
      createdAt: createdUserClinic.createdAt,
    };
  }
}
