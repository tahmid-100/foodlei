// src/modules/orders/orders.service.ts
import {
  Injectable, NotFoundException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Menu } from '../menus/menu.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStateMachineService } from './order-state-machine.service';
import { QUEUES, ORDER_JOBS } from '../../common/constants/queue.constants';
import { OrderStatus } from './enums/order-status.enum';
import { OrdersGateway } from './gateways/orders.gateway';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly stateMachine: OrderStateMachineService,
    @InjectQueue(QUEUES.ORDER)
    private readonly orderQueue: Queue,   // ← Queue inject
      @Inject(forwardRef(() => OrdersGateway))
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(dto: CreateOrderDto, customer: User): Promise<Order> {
    // Items validate করো এবং total calculate করো
    let totalAmount = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of dto.items) {
      const menu = await this.menuRepository.findOne({
        where: {
          id: item.menuId,
          restaurantId: dto.restaurantId,
          isAvailable: true,
        },
      });

      if (!menu) {
        throw new BadRequestException(
          `Menu item #${item.menuId} not found or unavailable`
        );
      }

      const subtotal = Number(menu.price) * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        menuId: item.menuId,
        quantity: item.quantity,
        unitPrice: menu.price,
        subtotal,
      });
    }

    const order = this.orderRepository.create({
      customerId: customer.id,
      restaurantId: dto.restaurantId,
      deliveryAddress: dto.deliveryAddress,
      notes: dto.notes,
      totalAmount,
      items: orderItems as OrderItem[],
    });

       const saved = await this.orderRepository.save(order);

    // ── Queue এ job add করো ──────────────────────
    await this.orderQueue.add(
      ORDER_JOBS.SEND_CONFIRMATION,
      {
        orderId: saved.id,
        customerEmail: customer.email,
        totalAmount: saved.totalAmount,
      },
      {
        attempts: 3,           // fail হলে ৩ বার retry
        backoff: {
          type: 'exponential', // retry delay বাড়তে থাকবে
          delay: 2000,         // 2s, 4s, 8s
        },
        removeOnComplete: 100, // শেষ ১০০টা completed job রাখো
        removeOnFail: 50,      // শেষ ৫০টা failed job রাখো
      }
    );

    await this.orderQueue.add(
      ORDER_JOBS.NOTIFY_RESTAURANT,
      {
        orderId: saved.id,
        restaurantId: saved.restaurantId,
        items: saved.items,
      },
      { attempts: 3 }
    );

        // WebSocket — সব connected clients কে new order জানাও
    this.ordersGateway.broadcastToAll('new-order', {
      orderId: saved.id,
      restaurantId: saved.restaurantId,
      totalAmount: saved.totalAmount,
    });
    

    return saved;
  }

  async findMyOrders(customerId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      relations: ['items', 'restaurant'],
    });
  }

  async findOne(id: number, user: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'restaurant', 'customer'],
    });

    if (!order) throw new NotFoundException(`Order #${id} not found`);

    if (order?.customer) {
       delete (order.customer as any).password;
      delete (order.customer as any).hashedRefreshToken;
      }

    // Customer শুধু নিজের order দেখতে পারবে
    if (
      user.role === UserRole.CUSTOMER &&
      order.customerId !== user.id
    ) {
      throw new ForbiddenException('This is not your order');
    }

    return order;
  }

  async updateStatus(
    id: number,
    dto: UpdateOrderStatusDto,
    user: User,
  ): Promise<Order> {
    const order = await this.findOne(id, user);
    const updatedOrder = this.stateMachine.transition(order, dto.status);
    const saved = await this.orderRepository.save(updatedOrder);

    // Status change এ customer কে notify করো
    await this.orderQueue.add(
      ORDER_JOBS.SEND_DELIVERY_UPDATE,
      {
        orderId: saved.id,
        customerEmail: order.customer?.email,
        status: saved.status,
      },
      { attempts: 3 }
    );


        // ── WebSocket — order watchers কে notify করো ──
    this.ordersGateway.notifyOrderStatus(
      saved.id,
      saved.status,
      {
        deliveryAddress: saved.deliveryAddress,
        confirmedAt: saved.confirmedAt,
        preparedAt: saved.preparedAt,
        deliveredAt: saved.deliveredAt,
      }
    );

    return saved;
  }

  
async findById(id: number): Promise<Order | null> {
  return this.orderRepository.findOne({ where: { id } });
  }
}