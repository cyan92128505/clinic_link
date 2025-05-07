import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Command for user registration
 */
export class RegisterCommand {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name!: string;

  @ApiProperty({
    description: 'User phone number',
    example: '0912345678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @ApiProperty({
    description: 'Clinic name to create (optional)',
    example: 'My Clinic',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Clinic name must be a string' })
  clinicName?: string;

  @ApiProperty({
    description: 'Clinic address (required if clinic name is provided)',
    example: 'No. 123, Example Street, Taipei City',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Clinic address must be a string' })
  clinicAddress?: string;

  @ApiProperty({
    description: 'Clinic phone number (required if clinic name is provided)',
    example: '0223456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Clinic phone must be a string' })
  clinicPhone?: string;
}
