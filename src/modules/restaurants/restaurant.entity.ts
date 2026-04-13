// src/modules/restaurants/restaurant.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  
  
} from 'typeorm';

@Entity('restaurants')

export class Restaurant {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100 })
  name?: string;

  @Column({ length: 255 })
  address?: string;

  @Column({ length: 20})
  phone?: string;

  @Column({ default: true })
  isActive?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}