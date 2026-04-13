// src/common/dto/pagination.dto.ts
import { IsOptional, IsPositive, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)        // query string "10" → number 10
  @IsInt()
  @IsPositive()
  page: number = 1;

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