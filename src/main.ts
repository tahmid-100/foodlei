import { NestFactory } from '@nestjs/core';
import { ValidationPipe ,VersioningType} from '@nestjs/common';
import { AppModule } from './app.module';
import { ThrottlerExceptionFilter } from './common/guards/throttler-exception.filter';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Global prefix — সব route /api দিয়ে শুরু হবে
  app.setGlobalPrefix('api');

    // Validation — আমরা পরে ব্যবহার করব
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // extra fields automatically strip হবে
      forbidNonWhitelisted: true,
      transform: true,        // string থেকে number এ auto convert
    }),
  );
   

    // Versioning enable করো
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',      // version না দিলে v1 ধরবে
  });

    

    // CORS — frontend থেকে call করতে পারবে
  app.enableCors();

  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Foodeli Backend running on: http://localhost:${port}/api`);

  app.useGlobalFilters(new ThrottlerExceptionFilter());
}
bootstrap();
