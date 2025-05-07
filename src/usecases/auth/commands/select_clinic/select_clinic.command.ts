import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Command to select active clinic
 */
export class SelectClinicCommand {
  @ApiProperty({
    description: 'Clinic ID to select',
    example: 'cl9ebqhxk0000dsr3xxxx1c1s',
  })
  @IsNotEmpty({ message: 'Clinic ID is required' })
  @IsString({ message: 'Clinic ID must be a string' })
  clinicId!: string;

  // userId will be added by the controller from the authenticated user
  userId?: string;
}
