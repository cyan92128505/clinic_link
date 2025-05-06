import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  Matches,
} from 'class-validator';
import { Gender } from 'src/domain/patient/value_objects/gender.enum';

export class PatientRegisterDto {
  @ApiProperty({
    description: 'Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZC...',
  })
  @IsString()
  @IsNotEmpty()
  readonly idToken: string;

  @ApiProperty({
    description: 'Patient name',
    example: '張小明',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Patient phone number',
    example: '0912345678',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^09\d{8}$/, {
    message: 'Phone must be a valid Taiwan mobile number',
  })
  readonly phone: string;

  @ApiPropertyOptional({
    description: 'National ID (ROC ID)',
    example: 'A123456789',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z][12]\d{8}$/, {
    message: 'National ID must be a valid Taiwan ID format',
  })
  readonly nationalId?: string;

  @ApiPropertyOptional({
    description: 'Birth date in ISO format',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  readonly birthDate?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  readonly gender?: Gender;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'patient@example.com',
  })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional({
    description: 'Patient address',
    example: '台北市信義區松仁路100號',
  })
  @IsString()
  @IsOptional()
  readonly address?: string;
}

export class VerifyPatientTokenDto {
  @ApiProperty({
    description: 'Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZC...',
  })
  @IsString()
  @IsNotEmpty()
  readonly idToken: string;
}
