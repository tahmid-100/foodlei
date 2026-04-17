// src/modules/restaurants/dto/create-restaurant.dto.ts
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateRestaurantDto {
    @ApiProperty({
    description: 'Restaurant এর নাম',
    example: 'Dhaka Biryani House',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name?: string;
  

  @ApiProperty({
    description: 'পূর্ণ ঠিকানা',
    example: 'Dhanmondi 27, Dhaka-1209',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 255)
  address?: string;

  @ApiProperty({
    description: '১১ সংখ্যার মোবাইল নম্বর',
    example: '01711234567',
    pattern: '^[0-9]{11}$',
  })
  @IsString()
  @Matches(/^[0-9]{11}$/, { message: 'phone must be 11 digits' })
  phone?: string;
}