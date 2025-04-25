import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from './infrastructure/auth/decorators/public.decorator';

interface WelcomeResponse {
  app: string;
  version: string;
  environment: string;
  status: string;
  timestamp: string;
  docs: string;
  health: string;
}

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome information' })
  getWelcome(): WelcomeResponse {
    const baseUrl = this.configService.get<string>(
      'BASE_URL',
      'http://localhost:3000',
    );
    const environment = this.configService.get<string>(
      'NODE_ENV',
      'development',
    );
    const version = this.configService.get<string>('APP_VERSION', '1.0.0');

    return {
      app: 'Clinic Link API',
      version: version,
      environment: environment,
      status: 'Online',
      timestamp: new Date().toISOString(),
      docs: `${baseUrl}/docs`,
      health: `${baseUrl}/health`,
    };
  }
}
