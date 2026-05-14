// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStateMachineService } from './order-state-machine.service';
import { OrderProcessor } from './processors/order.processor';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Menu } from '../menus/menu.entity';
import { QUEUES } from '../../common/constants/queue.constants';
import { OrdersGateway } from './gateways/orders.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Menu]),
    BullModule.registerQueue({
      name: QUEUES.ORDER,
    }),
    JwtModule.register({}),
    ConfigModule,
    BullBoardModule.forRoot({
      route: '/queues',          // http://localhost:3000/queues
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.ORDER,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderStateMachineService, OrderProcessor, OrdersGateway],
  exports: [OrdersService],
})
export class OrdersModule {}