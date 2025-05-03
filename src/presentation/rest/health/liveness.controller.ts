// src/presentation/rest/health/liveness.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/infrastructure/auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('liveness')
export class LivenessController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Simple liveness check' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
