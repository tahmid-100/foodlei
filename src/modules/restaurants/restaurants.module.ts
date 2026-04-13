// src/modules/restaurants/restaurants.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './restaurant.entity';
import {RestaurantsV2Controller} from './restaurants-v2.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  controllers: [RestaurantsController, RestaurantsV2Controller],
  providers: [RestaurantsService],
  exports: [RestaurantsService], // অন্য module use করতে পারবে
})
export class RestaurantsModule {}