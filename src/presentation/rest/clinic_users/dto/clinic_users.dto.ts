import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from 'src/domain/user/value_objects/role.enum';

// Data Transfer Object for adding a user to a clinic
export class AddUserToClinicDto {
  @IsString()
  userId!: string;

  @IsEnum(Role)
  role!: Role;
}

// Data Transfer Object for removing a user from a clinic
export class RemoveUserFromClinicDto {
  @IsString()
  userId!: string;
}

// Data Transfer Object for updating a user's role in a clinic
export class UpdateUserRoleDto {
  @IsString()
  userId!: string;

  @IsEnum(Role)
  newRole!: Role;
}

// Data Transfer Object for retrieving clinic users
export class GetClinicUsersDto {
  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
