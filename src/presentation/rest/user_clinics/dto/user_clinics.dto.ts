import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Role } from '../../../../domain/user/value_objects/role.enum';
import { Transform, TransformFnParams } from 'class-transformer';

export class GetUserClinicsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by roles (comma separated)',
    enum: Role,
    isArray: true,
    example: [Role.DOCTOR, Role.NURSE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  @Transform(({ value }: TransformFnParams): Role[] => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim() as Role);
    }
    return Array.isArray(value) ? value : [];
  })
  roles?: Role[];

  @ApiPropertyOptional({
    description: 'Include additional clinic details',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeDetails?: boolean;
}

export class UserClinicResponseDto {
  @ApiProperty({
    description: 'Clinic ID',
    example: 'cliabcdef0123456789',
  })
  clinicId!: string;

  @ApiProperty({
    description: 'Clinic name',
    example: 'City General Clinic',
  })
  name!: string;

  @ApiProperty({
    description: 'Clinic address',
    example: '123 Medical St, Healthcare City',
  })
  address!: string;

  @ApiProperty({
    description: 'Clinic phone number',
    example: '02-1234-5678',
  })
  phone!: string;

  @ApiProperty({
    description: 'Clinic logo URL',
    example: 'https://example.com/logo.png',
  })
  logo?: string;

  @ApiPropertyOptional({
    description: 'User role in the clinic',
    enum: Role,
    example: Role.DOCTOR,
  })
  role?: Role;
}

export class UserClinicDetailedResponseDto extends UserClinicResponseDto {
  @ApiProperty({
    description: 'Clinic email',
    example: 'info@clinic.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Clinic settings',
    example: { workingHours: { monday: '9:00-18:00' } },
  })
  settings?: Record<string, any>;

  @ApiProperty({
    description: 'Created date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last updated date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}

export class GetUserClinicsResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'usr123456789',
  })
  userId!: string;

  @ApiProperty({
    type: [UserClinicResponseDto],
    description: "List of user's clinics",
  })
  clinics!: UserClinicResponseDto[];
}

export class GetUserClinicsDetailedResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'usr123456789',
  })
  userId!: string;

  @ApiProperty({
    type: [UserClinicDetailedResponseDto],
    description: "List of user's clinics with detailed information",
  })
  clinics!: UserClinicDetailedResponseDto[];
}
