import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  HttpHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthCheckService;
  let httpIndicator: HttpHealthIndicator;
  let diskIndicator: DiskHealthIndicator;
  let memoryIndicator: MemoryHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              info: { app: { status: 'up' } },
              details: { app: { status: 'up' } },
            }),
          },
        },
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockReturnValue(
              Promise.resolve({
                app: { status: 'up' },
              }),
            ),
            responseCheck: jest.fn().mockReturnValue(
              Promise.resolve({
                database: { status: 'up' },
              }),
            ),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest.fn().mockReturnValue(
              Promise.resolve({
                storage: { status: 'up' },
              }),
            ),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockReturnValue(
              Promise.resolve({
                memory_heap: { status: 'up' },
              }),
            ),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              const configs = {
                DATABASE_URL:
                  'postgresql://postgres:postgres@postgres:5432/clinic_management',
              };
              return configs[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthCheckService>(HealthCheckService);
    httpIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    diskIndicator = module.get<DiskHealthIndicator>(DiskHealthIndicator);
    memoryIndicator = module.get<MemoryHealthIndicator>(MemoryHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return the health check result', async () => {
      const result = await controller.check();

      expect(healthService.check).toHaveBeenCalled();
      expect(result).toEqual({
        status: 'ok',
        info: { app: { status: 'up' } },
        details: { app: { status: 'up' } },
      });
    });

    it('should check app availability, database, disk and memory', async () => {
      await controller.check();

      expect(httpIndicator.pingCheck).toHaveBeenCalledWith(
        'app',
        'http://localhost:3000',
      );
      expect(httpIndicator.responseCheck).toHaveBeenCalledWith(
        'database',
        'PostgreSQL is configured',
        expect.any(Function),
      );
      expect(diskIndicator.checkStorage).toHaveBeenCalledWith('storage', {
        path: '/',
        thresholdPercent: 0.9,
      });
      expect(memoryIndicator.checkHeap).toHaveBeenCalledWith(
        'memory_heap',
        300 * 1024 * 1024,
      );
    });
  });
});
