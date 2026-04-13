// src/modules/restaurants/restaurants.service.ts
import { Injectable, NotFoundException,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository ,ILike,Like} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FilterRestaurantDto } from './dto/filter-restaurant.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(dto: CreateRestaurantDto): Promise<Restaurant> {

    const createdRestaurant=await this.restaurantRepository.findOne({
        where : {phone :dto.phone}
    });

    if(createdRestaurant){
        throw new ConflictException(
             `Restaurant with phone number ${dto.phone} already exists`
        );
    }
    const restaurant = this.restaurantRepository.create(dto);
    return this.restaurantRepository.save(restaurant);
  }

   async findAll(
    filters: FilterRestaurantDto,
  ): Promise<PaginatedResponse<Restaurant>> {
    const { search, isActive, sortBy, sortOrder, page, limit, skip } = filters;

    // Dynamic where condition বানাই
    const whereConditions: any = {};

    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    } else {
      whereConditions.isActive = true; // default: শুধু active গুলো
    }

    // Search — name অথবা address এ
    // ILike → case-insensitive LIKE
    const queryBuilder = this.restaurantRepository.createQueryBuilder('r');

    queryBuilder
      .where('r.isActive = :isActive', {
        isActive: whereConditions.isActive,
      });

    if (search) {
      queryBuilder.andWhere(
        '(r.name ILIKE :search OR r.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

// একটাই query — দুটো result একসাথে
const [data, total] = await queryBuilder
  .orderBy(`r.${sortBy}`, sortOrder)
  .skip(skip)
  .take(limit)
  .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }


  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }

    return restaurant;
  }

  async update(id: number, dto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.findOne(id); // NotFoundException handle হবে
    Object.assign(restaurant, dto);
    return this.restaurantRepository.save(restaurant);
  }

  async remove(id: number): Promise<void> {
    const restaurant = await this.findOne(id);
    // Hard delete না করে soft delete করি — isActive false করি
    restaurant.isActive = false;
    await this.restaurantRepository.save(restaurant);
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
}

