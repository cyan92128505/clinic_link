import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt_auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { CurrentUser } from '../../../infrastructure/auth/decorators/current_user.decorator';
import { Role } from '../../../domain/user/value_objects/role.enum';
import { User } from '../../../domain/user/entities/user.entity';

// Use Cases
import { GetUserClinicsHandler } from '../../../usecases/user_clinics/queries/get_user_clinics/get_user_clinics.handler';
import { GetUserClinicsByIdHandler } from '../../../usecases/user_clinics/queries/get_user_clinics_by_id/get_user_clinics_by_id.handler';

// Use Case Commands/Queries
import { GetUserClinicsQuery } from '../../../usecases/user_clinics/queries/get_user_clinics/get_user_clinics.query';
import { GetUserClinicsByIdQuery } from '../../../usecases/user_clinics/queries/get_user_clinics_by_id/get_user_clinics_by_id.query';

@ApiTags('user-clinics')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserClinicsController {
  constructor(
    private readonly getUserClinicsHandler: GetUserClinicsHandler,
    private readonly getUserClinicsByIdHandler: GetUserClinicsByIdHandler,
  ) {}

  @Get('me/clinics')
  @ApiOperation({ summary: "Get current user's clinics and roles" })
  @ApiResponse({
    status: 200,
    description: "Returns list of user's clinics with roles",
  })
  @ApiQuery({
    name: 'includeDetails',
    required: false,
    type: Boolean,
    description: 'Include additional clinic details',
  })
  @ApiQuery({
    name: 'roles',
    required: false,
    type: [String],
    isArray: true,
    enum: Role,
    description: 'Filter by specific roles',
  })
  async getCurrentUserClinics(
    @CurrentUser() currentUser: User,
    @Query('roles') roles?: Role[],
    @Query('includeDetails') includeDetails?: boolean,
  ) {
    const query = new GetUserClinicsQuery(
      currentUser.id,
      {
        userId: currentUser.id,
        userRole: currentUser.getRoleInClinic(
          currentUser.clinics?.[0]?.clinicId || '',
        ),
      },
      roles,
      includeDetails,
    );

    const result = await this.getUserClinicsHandler.execute(query);
    return result;
  }

  @Get(':userId/clinics')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get specific user's clinics" })
  @ApiResponse({
    status: 200,
    description: "Returns list of user's clinics",
  })
  @ApiQuery({
    name: 'clinicId',
    required: false,
    type: String,
    description: 'Filter by specific clinic ID',
  })
  @ApiQuery({
    name: 'includeDetails',
    required: false,
    type: Boolean,
    description: 'Include additional clinic details',
  })
  @ApiQuery({
    name: 'roles',
    required: false,
    type: [String],
    isArray: true,
    enum: Role,
    description: 'Filter by specific roles',
  })
  async getUserClinics(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
    @Query('clinicId') clinicId?: string,
    @Query('roles') roles?: Role[],
    @Query('includeDetails') includeDetails?: boolean,
  ) {
    const query = new GetUserClinicsByIdQuery(
      userId,
      {
        userId: currentUser.id,
        userRole: Role.ADMIN,
      },
      clinicId,
      roles,
      includeDetails,
    );

    const result = await this.getUserClinicsByIdHandler.execute(query);
    return result;
  }
}
