// src/modules/restaurants/restaurants.service.ts
import { Injectable, NotFoundException,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository ,Like} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

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

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
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

