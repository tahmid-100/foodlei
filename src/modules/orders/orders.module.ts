// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStateMachineService } from './order-state-machine.service';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Menu } from '../menus/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Menu])],
  controllers: [OrdersController],
  providers: [OrdersService, OrderStateMachineService],
  exports: [OrdersService],
})
export class OrdersModule {}