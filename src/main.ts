// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ThrottlerExceptionFilter } from './common/guards/throttler-exception.filter';
import { CacheDebugInterceptor } from './common/interceptors/cache-debug.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter as BullExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

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
  app.setGlobalPrefix('api', { exclude: ['health', 'health/ready'] });
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
  app.useGlobalInterceptors(new LoggingInterceptor());
  

  // 6. Bull Board — mounted directly on Express to avoid global-prefix conflicts
  const bullAdapter = new BullExpressAdapter();
  bullAdapter.setBasePath('/queues');
  const redisConnection = process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      };
  createBullBoard({
    queues: [new BullMQAdapter(new Queue('order-queue', { connection: redisConnection }))],
    serverAdapter: bullAdapter,
  });

  // Admin-only guard for /queues (Express middleware — bypasses NestJS guards)
  const jwtService = new JwtService({ secret: process.env.JWT_ACCESS_SECRET });
  const bullBoardGuard = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    const rawToken = auth?.startsWith('Bearer ') ? auth.slice(7) : (req.query.token as string);
    if (!rawToken) {
      return res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
    }
    try {
      const payload = jwtService.verify<{ role: string }>(rawToken);
      if (payload.role !== 'admin') {
        return res.status(403).json({ statusCode: 403, message: 'Forbidden: admin only' });
      }
      next();
    } catch {
      return res.status(401).json({ statusCode: 401, message: 'Invalid or expired token' });
    }
  };

  app.getHttpAdapter().getInstance().use('/queues', bullBoardGuard, bullAdapter.getRouter());

  // 7. Swagger
  const config = new DocumentBuilder()
    .setTitle('Foodeli API')
    .setDescription('Food Ordering System')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Manually document the Bull Board endpoint (served outside NestJS routing)
  document.paths['/queues'] = {
    get: {
      tags: ['Bull Board'],
      summary: 'Queue monitoring dashboard (admin only)',
      description: 'Opens the Bull Board UI. Requires a valid admin JWT in the Authorization header.',
      security: [{ JWT: [] }],
      responses: {
        200: { description: 'Bull Board UI' },
        401: { description: 'Missing or invalid token' },
        403: { description: 'Forbidden — admin role required' },
      },
    } as any,
  };

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  logger.log(`📚 Swagger: http://localhost:${process.env.PORT || 3000}/api/docs`);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Foodeli running on port ${port}`);
}
bootstrap();