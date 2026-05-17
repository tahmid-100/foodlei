// src/modules/restaurants/restaurants.service.ts
import { Injectable, NotFoundException,ConflictException,Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository ,ILike,Like} from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FilterRestaurantDto } from './dto/filter-restaurant.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import {CACHE_KEYS} from '../../common/constants/cache.constants'
import {CACHE_TTL} from '../../common/constants/cache.constants'

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
   @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,    // ← Cache inject
  ) {}

    async create(dto: CreateRestaurantDto): Promise<Restaurant> {
    const existing = await this.restaurantRepository.findOne({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException(
        `Restaurant with phone number ${dto.phone} already exists`,
      );
    }

    const restaurant = this.restaurantRepository.create(dto);
    const saved = await this.restaurantRepository.save(restaurant);

    // নতুন restaurant → cache invalidate করো
    await this.invalidateRestaurantCache();

    return saved;
  }

   async findAll(
    filters: FilterRestaurantDto,
  ): Promise<PaginatedResponse<Restaurant>> {
    // Filter থাকলে cache করব না — too many combinations
    const hasFilters = filters.search || filters.isActive !== undefined;

    if (!hasFilters) {
      // Cache key বানাও — page আর limit সহ
      const cacheKey = `${CACHE_KEYS.ALL_RESTAURANTS}:p${filters.page}:l${filters.limit}:s${filters.sortBy}:o${filters.sortOrder}`;

      // Cache এ আছে কিনা দেখো
      const cached = await this.cacheManager.get<PaginatedResponse<Restaurant>>(cacheKey);
      if (cached) {
        console.log(`🚀 Cache HIT: ${cacheKey}`);
        return cached;
      }
      console.log(`💾 Cache MISS: ${cacheKey} — fetching from DB`);
    }

    // DB থেকে আনো
    const { search, isActive, sortBy, sortOrder, skip, limit, page } = filters;

    const queryBuilder = this.restaurantRepository.createQueryBuilder('r');
    queryBuilder.where('r.isActive = :isActive', {
      isActive: isActive ?? true,
    });

    if (search) {
      queryBuilder.andWhere(
        '(r.name ILIKE :search OR r.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy(`r.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const result: PaginatedResponse<Restaurant> = {
      data,
      meta: {
        total, page, limit, totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    // Filter নেই → cache করো
    if (!hasFilters) {
      const cacheKey = `${CACHE_KEYS.ALL_RESTAURANTS}:p${page}:l${limit}:s${sortBy}:o${sortOrder}`;
      await this.cacheManager.set(cacheKey, result, CACHE_TTL.RESTAURANTS);
    }

    return result;
  }



  async findOne(id: number): Promise<Restaurant> {
    const cacheKey = CACHE_KEYS.RESTAURANT(id);

    // Cache check
    const cached = await this.cacheManager.get<Restaurant>(cacheKey);
    if (cached) {
      console.log(`🚀 Cache HIT: ${cacheKey}`);
      return cached;
    }

    console.log(`💾 Cache MISS: ${cacheKey}`);
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }

    // Cache করো
    await this.cacheManager.set(cacheKey, restaurant, CACHE_TTL.RESTAURANTS);
    return restaurant;
  }



  async update(id: number, dto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    Object.assign(restaurant, dto);
    const saved = await this.restaurantRepository.save(restaurant);

    // Update হলে cache invalidate করো
    await this.cacheManager.del(CACHE_KEYS.RESTAURANT(id));
    await this.invalidateRestaurantCache();

    return saved;
  }

  async remove(id: number): Promise<void> {
    const restaurant = await this.findOne(id);
    restaurant.isActive = false;
    await this.restaurantRepository.save(restaurant);

    // Delete হলে cache invalidate করো
    await this.cacheManager.del(CACHE_KEYS.RESTAURANT(id));
    await this.invalidateRestaurantCache();
  }


  async searchByName(name:string):Promise<Restaurant[]>{

    return this.restaurantRepository.find({
      where: {
        name: Like(`%${name}%`),  // Case-sensitive like search
        isActive: true,
      },
      order: { name: 'ASC' },
    });   

  }


//--------helpers---------
private async invalidateRestaurantCache(): Promise<void> {
  const client = (this.cacheManager as any).store.client; // Redis client
  const keys = await client.keys('restaurants:*'); // সব restaurant keys
  if (keys.length > 0) {
    await client.del(keys); // একসাথে সব delete
  }
}

    
}

