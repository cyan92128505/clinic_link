/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  let healthService: { check: jest.Mock };
  let httpIndicator: { pingCheck: jest.Mock; responseCheck: jest.Mock };
  let diskIndicator: { checkStorage: jest.Mock };
  let memoryIndicator: { checkHeap: jest.Mock };

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
            get: jest.fn((key: string, defaultValue: unknown) => {
              // 使用 Record 型別來明確表示這是一個字典
              const configs: Record<string, string> = {
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

    // 使用明確的型別註解來避免未綁定方法警告
    healthService = module.get(HealthCheckService);
    httpIndicator = module.get(HttpHealthIndicator);
    diskIndicator = module.get(DiskHealthIndicator);
    memoryIndicator = module.get(MemoryHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return the health check result', async () => {
      const result = await controller.check();

      // 直接使用 mockFn.mock.calls 而不是透過方法調用
      expect(healthService.check.mock.calls).toHaveLength(1);
      expect(result).toEqual({
        status: 'ok',
        info: { app: { status: 'up' } },
        details: { app: { status: 'up' } },
      });
    });

    it('should check app availability, database, disk and memory', async () => {
      await controller.check();

      // 針對每個 mock 函數進行型別安全的調用檢查
      const pingCheckCalls = httpIndicator.pingCheck.mock.calls;
      expect(pingCheckCalls).toHaveLength(1);
      expect(pingCheckCalls[0][0]).toBe('app');
      expect(pingCheckCalls[0][1]).toBe('http://localhost:3000');

      const responseCheckCalls = httpIndicator.responseCheck.mock.calls;
      expect(responseCheckCalls).toHaveLength(1);
      expect(responseCheckCalls[0][0]).toBe('database');
      expect(responseCheckCalls[0][1]).toBe('PostgreSQL is configured');
      // 檢查第三個參數是函數
      expect(typeof responseCheckCalls[0][2]).toBe('function');

      const checkStorageCalls = diskIndicator.checkStorage.mock.calls;
      expect(checkStorageCalls).toHaveLength(1);
      expect(checkStorageCalls[0][0]).toBe('storage');
      // 使用 toMatchObject 而不是 toEqual 來避免型別問題
      expect(checkStorageCalls[0][1]).toMatchObject({
        path: '/',
        thresholdPercent: 0.9,
      });

      const checkHeapCalls = memoryIndicator.checkHeap.mock.calls;
      expect(checkHeapCalls).toHaveLength(1);
      expect(checkHeapCalls[0][0]).toBe('memory_heap');
      expect(checkHeapCalls[0][1]).toBe(300 * 1024 * 1024);
    });
  });
});
