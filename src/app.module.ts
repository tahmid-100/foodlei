import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
  
      // ১. Config — সব জায়গায় .env পড়তে পারব
    ConfigModule.forRoot({
      isGlobal: true,          // সব module এ automatically available
      load: [databaseConfig],
      envFilePath: '.env',
    }),


        // ২. Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,     // ⚠️ development only!
        logging: true,
      }),
      inject: [ConfigService],
    }),

         
  ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ([
    {
      name: 'short',
      ttl: config.get<number>('THROTTLE_TTL')??6000,
      limit: config.get<number>('THROTTLE_LIMIT')??100,
    },
    ]),
   }), 



    RestaurantsModule,
    AuthModule,


  ],


    providers: [
    // Global guard — সব route এ automatically apply হবে
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],

})
export class AppModule {}
