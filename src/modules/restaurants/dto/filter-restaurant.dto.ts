// src/modules/restaurants/dto/filter-restaurant.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterRestaurantDto extends PaginationDto {

    //GET /api/restaurants?search=biryani
  @IsOptional()
  @IsString()
  search?: string;           // name বা address এ search 
 // Will find: "Biryani House", "Biryani Center", etc.

// Get only active restaurants
//GET /api/restaurants?isActive=true
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;




//GET /api/restaurants?sortBy=name/createdAt
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}