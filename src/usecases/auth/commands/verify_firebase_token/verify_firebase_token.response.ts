import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * Response for verify Firebase token command
 */
export class VerifyFirebaseTokenResponse {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({
    description: 'User information',
    type: Object,
  })
  user!: {
    id: string;
    email: string;
    name: string;
    clinics: {
      id: string;
      name: string;
      role: Role;
    }[];
  };

  @ApiProperty({
    description: 'Whether this is a new user',
    example: false,
  })
  isNewUser!: boolean;
}
