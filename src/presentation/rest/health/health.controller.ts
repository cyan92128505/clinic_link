import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheckResult,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/common/database/prisma/prisma.service';
import { Public } from 'src/infrastructure/auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Get()
  @Public() // Mark this endpoint as public (no authentication required)
  @HealthCheck()
  @ApiOperation({ summary: 'Check system health' })
  @ApiResponse({ status: 200, description: 'The service is healthy' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Check if the application is running
      () => this.http.pingCheck('app', 'http://localhost:3000'),

      // Check the database connection using PrismaHealthIndicator
      () => this.prismaHealth.pingCheck('database', this.prisma),

      // Check disk storage
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.99,
        }),

      // Check memory usage
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
    ]);
  }
}
