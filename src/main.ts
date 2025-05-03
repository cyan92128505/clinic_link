import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DateTimeInterceptor } from './infrastructure/common/services/datetime.interceptor';

async function bootstrap() {
  // 設置應用程式時區
  process.env.TZ = 'Asia/Taipei';

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get environment variables
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const globalPrefix = configService.get<string>('GLOBAL_PREFIX', 'v1');
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Get CORS settings from environment variables
  const corsOriginEnv = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:5173',
  );

  // Set global prefix
  app.setGlobalPrefix(`${apiPrefix}/${globalPrefix}`, {
    exclude: ['', 'health'], // Exclude root path and health check from prefix
  });

  // Configure CORS based on environment
  if (environment === 'development') {
    // In development, allow all origins
    app.enableCors({
      origin: true, // This allows all origins
      credentials: true,
    });
    console.log('Development mode: CORS enabled for all origins');
  } else {
    // In production, use restricted origins from config
    const corsOrigins = corsOriginEnv.split(',').map((origin) => origin.trim());
    app.enableCors({
      origin: corsOrigins,
      credentials: true,
    });
    console.log(
      `Production mode: CORS enabled for origins: ${corsOrigins.join(', ')}`,
    );
  }

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // app.useGlobalInterceptors(app.get(DateTimeInterceptor));

  // Setup Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Clinics Link API')
    .setDescription('API documentation for the Clinics Link')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Start the application
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
