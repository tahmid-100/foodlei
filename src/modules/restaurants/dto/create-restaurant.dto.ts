// src/modules/restaurants/dto/create-restaurant.dto.ts
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name?: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 255)
  address?: string;

  @IsString()
  @Matches(/^[0-9]{11}$/, { message: 'phone must be 11 digits' })
  phone?: string;
}