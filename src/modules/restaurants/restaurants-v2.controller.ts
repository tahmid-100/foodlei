// src/modules/restaurants/restaurants-v2.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';

@Controller({ path: 'restaurants', version: '2' })
export class RestaurantsV2Controller {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async findAll() {
    const restaurants = await this.restaurantsService.findAll();

    // v2 তে extra field যোগ করলাম
    return restaurants.map((r) => ({
      ...r,
      menuCount: 0,          // পরে real data আসবে
      displayName: r.name,
    }));
  }

  @Get('search')
  async search(@Query('name') name: string) {
    if (!name) {
      return {
        message: 'provide a search term',
      };
    }

    const restaurants = await this.restaurantsService.searchByName(name);

    return {
      query: name,

      data: restaurants.map((r) => ({
        ...r,
        menuCount: 0,
        displayName: r.name,
        searchMatch: true,
      })),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const restaurant = await this.restaurantsService.findOne(id);
    return {
      ...restaurant,
      menuCount: 0,
      displayName: restaurant.name,
    };
  }
}