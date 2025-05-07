import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * Response for select clinic command
 */
export class SelectClinicResponse {
  @ApiProperty({
    description: 'Selected clinic information',
    type: Object,
  })
  clinic!: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email?: string;
    logo?: string;
    role: Role;
  };
}
