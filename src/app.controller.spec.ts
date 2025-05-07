import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let configService: ConfigService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: unknown) => {
              // Mock implementation of ConfigService
              const configs: Record<string, string> = {
                BASE_URL: 'http://localhost:3000',
                NODE_ENV: 'test',
                APP_VERSION: '1.0.0',
              };
              return configs[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    configService = app.get<ConfigService>(ConfigService);
  });

  describe('root', () => {
    it('should return welcome message with correct data', () => {
      // Mock the date to get a consistent timestamp for testing
      const mockDate = new Date('2025-04-26T12:00:00Z');

      // Use spyOn instead of direct replacement of global Date
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Verify configService is used correctly
      const spyConfigGet = jest.spyOn(configService, 'get');

      const result = appController.getWelcome();

      // Verify that configService.get was called with expected parameters
      expect(spyConfigGet).toHaveBeenCalledWith(
        'APP_VERSION',
        expect.any(String),
      );
      expect(spyConfigGet).toHaveBeenCalledWith('NODE_ENV', 'development');
      expect(spyConfigGet).toHaveBeenCalledWith(
        'BASE_URL',
        'http://localhost:3000',
      );

      expect(result).toEqual({
        app: 'Clinic Link API',
        version: '1.0.0',
        environment: 'test',
        status: 'Online',
        timestamp: mockDate.toISOString(),
        docs: 'http://localhost:3000/docs',
        health: 'http://localhost:3000/health',
      });

      // Reset the Date mock
      jest.spyOn(global, 'Date').mockRestore();
    });
  });
});
