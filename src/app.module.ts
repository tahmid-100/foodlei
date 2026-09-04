import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import {HealthModule} from './modules/health/health.module';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [


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
  
      // ১. Config — সব জায়গায় .env পড়তে পারব
    ConfigModule.forRoot({
      isGlobal: true,          // সব module এ automatically available
      load: [databaseConfig],
      envFilePath: '.env',
    }),


        // ২. Database connection
     
        // src/app.module.ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService): TypeOrmModuleOptions => {
    const databaseUrl = config.get<string>('DATABASE_URL');

    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      };
    }

    return {
      type: 'postgres',
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_NAME'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    };
  },
  inject: [ConfigService],
}),


   BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    connection: config.get('REDIS_URL')
      ? { url: config.get('REDIS_URL') }
      : {
          host: config.get('REDIS_HOST') || 'localhost',
          port: config.get<number>('REDIS_PORT') || 6379,
        },
  }),
  inject: [ConfigService],
}),

CacheModule.registerAsync({
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    const redisUrl = config.get('REDIS_URL');
    return {
      store: redisStore,
      ...(redisUrl
        ? { url: redisUrl }
        : {
            socket: {
              host: config.get('REDIS_HOST') || 'localhost',
              port: config.get<number>('REDIS_PORT') || 6379,
            },
          }),
      ttl: 60 * 1000,
    };
  },
  inject: [ConfigService],
}),


    RestaurantsModule,
    AuthModule,
    OrdersModule,
    PaymentsModule,
    HealthModule,


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
