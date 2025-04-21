import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * Response for get current user query
 */
export class GetCurrentUserResponse {
  @ApiProperty({
    description: 'User ID',
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User phone',
    example: '0912345678',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'User avatar URL',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Last login time',
    example: '2023-11-01T12:00:00Z',
    required: false,
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Clinics the user has access to',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cl9ebqhxk0000dsr3xxxx1c1s' },
        name: { type: 'string', example: 'My Clinic' },
        role: {
          type: 'string',
          enum: Object.values(Role),
          example: 'CLINIC_ADMIN',
        },
      },
    },
  })
  clinics: {
    id: string;
    name: string;
    role: Role;
  }[];

  @ApiProperty({
    description: 'Account created time',
    example: '2023-10-01T00:00:00Z',
  })
  createdAt: Date;
}
