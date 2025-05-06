import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt_auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { CurrentUser } from '../../../infrastructure/auth/decorators/current_user.decorator';
import { Role } from '../../../domain/user/value_objects/role.enum';
import { User } from '../../../domain/user/entities/user.entity';

// Use Cases
import { AddUserToClinicHandler } from '../../../usecases/user_clinics/commands/add_user_to_clinic/add_user_to_clinic.handler';
import { RemoveUserFromClinicHandler } from '../../../usecases/user_clinics/commands/remove_user_from_clinic/remove_user_from_clinic.handler';
import { UpdateUserRoleHandler } from '../../../usecases/user_clinics/commands/update_user_role/update_user_role.handler';
import { GetClinicUsersHandler } from '../../../usecases/user_clinics/queries/get_clinic_users/get_clinic_users.handler';

// DTOs
import {
  AddUserToClinicDto,
  RemoveUserFromClinicDto,
  UpdateUserRoleDto,
  GetClinicUsersDto,
} from './dto/clinic_users.dto';

// Use Case Commands/Queries
import { AddUserToClinicCommand } from '../../../usecases/user_clinics/commands/add_user_to_clinic/add_user_to_clinic.command';
import { RemoveUserFromClinicCommand } from '../../../usecases/user_clinics/commands/remove_user_from_clinic/remove_user_from_clinic.command';
import { UpdateUserRoleCommand } from '../../../usecases/user_clinics/commands/update_user_role/update_user_role.command';
import { GetClinicUsersQuery } from '../../../usecases/user_clinics/queries/get_clinic_users/get_clinic_users.query';

@ApiTags('clinic-users')
@Controller('clinics/:clinicId/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClinicUsersController {
  constructor(
    private readonly addUserToClinicHandler: AddUserToClinicHandler,
    private readonly removeUserFromClinicHandler: RemoveUserFromClinicHandler,
    private readonly updateUserRoleHandler: UpdateUserRoleHandler,
    private readonly getClinicUsersHandler: GetClinicUsersHandler,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Add a user to a clinic' })
  @ApiResponse({
    status: 201,
    description: 'User added to clinic successfully',
  })
  async addUserToClinic(
    @Param('clinicId') clinicId: string,
    @Body() dto: AddUserToClinicDto,
    @CurrentUser() currentUser: User,
  ) {
    const command = new AddUserToClinicCommand(clinicId, dto.userId, dto.role, {
      userId: currentUser.id,
      userRole: currentUser.getRoleInClinic(clinicId),
    });

    return await this.addUserToClinicHandler.execute(command);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN, Role.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Remove a user from a clinic' })
  @ApiResponse({
    status: 204,
    description: 'User removed from clinic successfully',
  })
  async removeUserFromClinic(
    @Param('clinicId') clinicId: string,
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ) {
    const command = new RemoveUserFromClinicCommand(clinicId, userId, {
      userId: currentUser.id,
      userRole: currentUser.getRoleInClinic(clinicId),
    });

    return await this.removeUserFromClinicHandler.execute(command);
  }

  @Put(':userId/role')
  @Roles(Role.ADMIN, Role.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Update user role in a clinic' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  async updateUserRole(
    @Param('clinicId') clinicId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    const command = new UpdateUserRoleCommand(clinicId, userId, dto.newRole, {
      userId: currentUser.id,
      userRole: currentUser.getRoleInClinic(clinicId),
    });

    return await this.updateUserRoleHandler.execute(command);
  }

  @Get()
  @Roles(Role.ADMIN, Role.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Get users in a clinic' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved clinic users successfully',
  })
  async getClinicUsers(
    @Param('clinicId') clinicId: string,
    @Query() query: GetClinicUsersDto,
    @CurrentUser() currentUser: User,
  ) {
    const queryObj = new GetClinicUsersQuery(
      clinicId,
      {
        userId: currentUser.id,
        userRole: currentUser.getRoleInClinic(clinicId),
      },
      query.roles,
      {
        page: query.page,
        limit: query.limit,
      },
      query.search,
    );

    return await this.getClinicUsersHandler.execute(queryObj);
  }
}
