import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

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

    // CORS — frontend থেকে call করতে পারবে
  app.enableCors();

  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Foodeli Backend running on: http://localhost:${port}/api`);
}
bootstrap();
