// src/common/dto/pagination.dto.ts
import { IsOptional, IsPositive, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)        // query string "10" → number 10
  @IsInt()
  @IsPositive()
  page: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Items per page (max 100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)                  // maximum 100 items per page
  limit: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}