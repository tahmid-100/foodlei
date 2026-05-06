// src/modules/menus/menu.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from '../restaurants/restaurant.entity';

@Entity('menus')
export class Menu {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Chicken Biryani' })
  @Column({ length: 100 })
  name!: string;

  @ApiProperty({ example: 'Aromatic rice with tender chicken' })
  @Column({ length: 255, nullable: true })
  description?: string;

  @ApiProperty({ example: 180 })
  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isAvailable!: boolean;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  restaurant!: Restaurant;

  @Column()
  restaurantId!: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}