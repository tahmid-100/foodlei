// src/modules/orders/order.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from './enums/order-status.enum';
import { User } from '../users/user.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ length: 255 })
  deliveryAddress!: string;

  @Column({ nullable: true })
  notes?: string;

  // কখন কোন state এ গেছে — audit trail
  @Column({ nullable: true })
  confirmedAt!: Date;

  @Column({ nullable: true })
  preparedAt!: Date;

  @Column({ nullable: true })
  deliveredAt!: Date;

  @Column({ nullable: true })
  cancelledAt!: Date;

  @ManyToOne(() => User)
  customer!: User;

  @Column()
  customerId!: number;

  @ManyToOne(() => Restaurant)
  restaurant!: Restaurant;

  @Column()
  restaurantId!: number;

  @OneToMany(() => OrderItem, (item: OrderItem) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}