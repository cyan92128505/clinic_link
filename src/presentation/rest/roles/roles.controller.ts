import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt_auth.guard';
import { GetAllRolesQuery } from 'src/usecases/roles/queries/get_all_roles/get_all_roles.query';
import { GetAllRolesResponse } from 'src/usecases/roles/queries/get_all_roles/get_all_roles.response';
import {
  GetAllRolesResponseDto,
  GetRolesQueryDto,
  GetSimpleRolesResponseDto,
} from './dto/roles.dto';
import { Role } from 'src/domain/user/value_objects/role.enum';

// 定義 Request 的使用者型別
interface RequestWithUser extends Request {
  user: {
    id: string;
    selectedClinicRole: Role;
  };
}

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiQuery({
    name: 'detailed',
    required: false,
    type: Boolean,
    description: 'Whether to include detailed descriptions',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all roles',
    type: GetAllRolesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllRoles(
    @Query() query: GetRolesQueryDto,
    @Request() req: RequestWithUser,
  ): Promise<GetAllRolesResponseDto | GetSimpleRolesResponseDto> {
    // Create query with user context for access control
    const getAllRolesQuery = new GetAllRolesQuery({
      userId: req.user.id,
      userRole: req.user.selectedClinicRole,
    });

    // Execute the query
    const result = await this.queryBus.execute<
      GetAllRolesQuery,
      GetAllRolesResponse
    >(getAllRolesQuery);

    // Create a proper response object from the result
    const response = new GetAllRolesResponse({
      roles: result.roles,
    });

    // Return full or simplified response based on query parameter
    return query.detailed
      ? response.toDetailedResponse()
      : response.toSimpleResponse();
  }
}
