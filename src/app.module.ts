import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';

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

    RestaurantsModule,


  ],

})
export class AppModule {}
