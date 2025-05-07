import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/domain/user/value_objects/role.enum';

// Response DTO for role descriptions
export class RoleDescriptionDto {
  @ApiProperty({
    enum: Role,
    description: 'Role enum value',
    example: 'CLINIC_ADMIN',
  })
  value!: Role;

  @ApiProperty({
    description: 'Human-readable role name',
    example: '診所管理員',
  })
  label!: string;

  @ApiProperty({
    description: 'Detailed role description',
    example: '管理特定診所的使用者、設定和基本營運',
  })
  description!: string;
}

// Response DTO for simple role list (value and label only)
export class SimpleRoleDto {
  @ApiProperty({
    enum: Role,
    description: 'Role enum value',
    example: 'CLINIC_ADMIN',
  })
  value!: Role;

  @ApiProperty({
    description: 'Human-readable role name',
    example: '診所管理員',
  })
  label!: string;
}

// Response DTO for all roles
export class GetAllRolesResponseDto {
  @ApiProperty({
    type: [RoleDescriptionDto],
    description: 'List of all available roles with descriptions',
  })
  roles!: RoleDescriptionDto[];
}

// Response DTO for simplified roles list
export class GetSimpleRolesResponseDto {
  @ApiProperty({
    type: [SimpleRoleDto],
    description: 'List of all available roles (simplified)',
  })
  roles!: SimpleRoleDto[];
}

// Query parameter for roles API
export class GetRolesQueryDto {
  @ApiProperty({
    description: 'Whether to include detailed descriptions',
    required: false,
    default: false,
  })
  detailed?: boolean;
}
