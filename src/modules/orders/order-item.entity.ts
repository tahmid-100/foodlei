// src/modules/orders/order-item.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
} from 'typeorm';
import { Order } from './order.entity';
import { Menu } from '../menus/menu.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  // Order করার সময়ের price — পরে বদলালেও problem নেই
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;

  @ManyToOne(() => Menu)
  menu!: Menu;

  @Column()
  menuId!: number;
}