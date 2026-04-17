// src/modules/restaurants/restaurant.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  
  
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
@Entity('restaurants')

export class Restaurant {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id?: number;
  
  @ApiProperty({ example: 'Dhaka Biryani House' })
  @Column({ length: 100 })
  name?: string;
  
  @ApiProperty({ example: 'Dhanmondi 27, Dhaka' })
  @Column({ length: 255 })
  address?: string;

  @ApiProperty({ example: '01711234567' })
  @Column({ length: 20})
  phone?: string;

 @ApiProperty({ example: true })
  @Column({ default: true })
  isActive?: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;
  
 @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}