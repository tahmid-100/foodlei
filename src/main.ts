// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ThrottlerExceptionFilter } from './common/guards/throttler-exception.filter';
import { CacheDebugInterceptor } from './common/interceptors/cache-debug.interceptor';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
   const app = await NestFactory.create(AppModule, {
    rawBody: true,   // ← এটা যোগ করো
  });
  // 1. Security Headers
  app.use(helmet());

  // 2. CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 3. Global Prefix + Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 4. Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 5. Global Exception Filter
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new ThrottlerExceptionFilter(),
  );
 
  
  app.useGlobalInterceptors(new CacheDebugInterceptor());
  

  // 6. Swagger
  const config = new DocumentBuilder()
    .setTitle('Foodeli API')
    .setDescription('Food Ordering System')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  logger.log(`📚 Swagger: http://localhost:${process.env.PORT || 3000}/api/docs`);
  

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Foodeli running on port ${port}`);
}
bootstrap();