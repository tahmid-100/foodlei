// src/modules/restaurants/dto/update-restaurant.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';

// PartialType মানে সব fields optional হয়ে যাবে — PATCH এর জন্য perfect
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}