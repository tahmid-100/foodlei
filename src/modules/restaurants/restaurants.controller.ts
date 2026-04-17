// src/modules/restaurants/restaurants.controller.ts
import {
  Controller, Get, Post, Body, Patch,
  Param, Delete, ParseIntPipe, HttpCode, HttpStatus,Query,
} from '@nestjs/common';

import {
  ApiTags, ApiOperation, ApiResponse,
  ApiParam, ApiQuery, ApiBearerAuth,
} from '@nestjs/swagger';

import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FilterRestaurantDto } from './dto/filter-restaurant.dto';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Restaurant } from './restaurant.entity';
@ApiTags('restaurants')          // Swagger তে group করবে
@Controller({ path: 'restaurants', version: '1' }) // → /api/v1/restaurants
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Throttle({ short: { ttl: 10000, limit: 3 } })
  @HttpCode(HttpStatus.CREATED)  // 201
  @ApiOperation({ summary: 'নতুন restaurant তৈরি করো' })
  @ApiResponse({ status: 201, description: 'Restaurant তৈরি হয়েছে', type: Restaurant })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Phone number already exists' })
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  
  @Get()
  @ApiOperation({ summary: 'সব restaurants এর list (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated restaurant list' })
  @SkipThrottle() 
  findAll(@Query() filters: FilterRestaurantDto) {
    return this.restaurantsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'একটা restaurant এর details' })
  @ApiParam({ name: 'id', description: 'Restaurant ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Restaurant found', type: Restaurant })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe → "5" string কে 5 number এ convert করে
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Restaurant আংশিক update করো' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Updated successfully', type: Restaurant })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  // 204 — body নেই
  @ApiOperation({ summary: 'Restaurant soft delete করো' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.remove(id);
  }
}