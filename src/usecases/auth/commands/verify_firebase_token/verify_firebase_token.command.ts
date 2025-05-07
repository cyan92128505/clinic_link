import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Command to verify Firebase ID token
 */
export class VerifyFirebaseTokenCommand {
  @ApiProperty({
    description: 'Firebase ID token',
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOTczZWUwZTE2ZjdlZWY4NDAwZjg4NjE3YTRkZjI1MjFlMDQ3NzQiLCJ0eXAiOiJKV1QifQ...',
  })
  @IsNotEmpty({ message: 'Firebase token is required' })
  @IsString({ message: 'Firebase token must be a string' })
  token!: string;
}
