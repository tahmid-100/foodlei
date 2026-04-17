// src/modules/restaurants/dto/filter-restaurant.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterRestaurantDto extends PaginationDto {

    //GET /api/restaurants?search=biryani
  @ApiPropertyOptional({example:'biryani'})
  @IsOptional()
  @IsString()
  search?: string;           // name বা address এ search 
 // Will find: "Biryani House", "Biryani Center", etc.

// Get only active restaurants
//GET /api/restaurants?isActive=true
@ApiPropertyOptional({example:true})
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;




//GET /api/restaurants?sortBy=name/createdAt
@ApiPropertyOptional({example:'Dhaka Biryani House || time'})
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'createdAt' = 'createdAt';
@ApiPropertyOptional({example:'ASC||DESC'})
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}