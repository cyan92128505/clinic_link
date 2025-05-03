// src/presentation/rest/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../../infrastructure/common/database/prisma/prisma.service';
import { Public } from 'src/infrastructure/auth/decorators/public.decorator';
import { Injectable } from '@nestjs/common';

@Injectable()
class CachedHealthService {
  private lastCheck: { time: number; result: HealthCheckResult | null } = {
    time: 0,
    result: null,
  };

  private readonly CACHE_DURATION = 60000; // 1 minute cache

  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  async getHealthStatus(): Promise<HealthCheckResult> {
    const now = Date.now();

    // Return cached result if available and not expired
    if (
      this.lastCheck.result &&
      now - this.lastCheck.time < this.CACHE_DURATION
    ) {
      return this.lastCheck.result;
    }

    // Perform actual health check
    const result = await this.health.check([
      () =>
        this.prismaHealth.pingCheck('database', this.prisma, {
          timeout: 3000,
        }),
    ]);

    // Cache the result
    this.lastCheck = { time: now, result };

    return result;
  }
}

@ApiTags('Health')
@Controller()
export class HealthController {
  private cachedHealthService: CachedHealthService;

  constructor(
    health: HealthCheckService,
    prismaHealth: PrismaHealthIndicator,
    prisma: PrismaService,
  ) {
    this.cachedHealthService = new CachedHealthService(
      health,
      prismaHealth,
      prisma,
    );
  }

  @Get('/health')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'The service is healthy' })
  async check(): Promise<HealthCheckResult> {
    return this.cachedHealthService.getHealthStatus();
  }
}
