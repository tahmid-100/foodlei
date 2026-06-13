import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import {HealthModule} from './modules/health/health.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from './common/constants/queue.constants';
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


    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: configService.get('REDIS_URL')
          ? { url: configService.get('REDIS_URL') }  // URL দিয়ে connect (password সহ)
          : {
              host: configService.get('REDIS_HOST') || 'localhost',
              port: parseInt(configService.get('REDIS_PORT') || '6379'),
            },
      }),
      inject: [ConfigService],
    }),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.ORDER,
      adapter: BullMQAdapter,
    }),

  CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async (configService: ConfigService) => ({
    store: redisStore,
    url: configService.get('REDIS_URL') || undefined,
    socket: configService.get('REDIS_URL') ? undefined : {
      host: configService.get('REDIS_HOST') || 'localhost',
      port: parseInt(configService.get('REDIS_PORT') || '6379'),
    },
    ttl: 60 * 1000,
  }),
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
