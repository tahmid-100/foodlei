// src/modules/orders/dto/create-order.dto.ts
import { IsArray, IsNotEmpty, IsNumber,
  IsPositive, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  menuId!: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  restaurantId!: number;

  @ApiProperty({ example: 'Dhanmondi 27, Dhaka' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @ApiProperty({ example: 'Extra spicy please' })
  @IsString()
  notes?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}