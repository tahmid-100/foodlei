// src/modules/restaurants/restaurants.controller.ts
import {
  Controller, Get, Post, Body, Patch,
  Param, Delete, ParseIntPipe, HttpCode, HttpStatus,Query,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FilterRestaurantDto } from './dto/filter-restaurant.dto';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller({ path: 'restaurants', version: '1' }) // → /api/v1/restaurants
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Throttle({ short: { ttl: 10000, limit: 3 } })
  @HttpCode(HttpStatus.CREATED)  // 201
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  
  @Get()
  @SkipThrottle() 
  findAll(@Query() filters: FilterRestaurantDto) {
    return this.restaurantsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe → "5" string কে 5 number এ convert করে
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  // 204 — body নেই
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.remove(id);
  }
}