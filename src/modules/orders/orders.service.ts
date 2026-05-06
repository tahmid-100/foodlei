// src/modules/orders/orders.service.ts
import {
  Injectable, NotFoundException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Menu } from '../menus/menu.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStateMachineService } from './order-state-machine.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly stateMachine: OrderStateMachineService,
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

    return this.orderRepository.save(order);
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

    // State machine দিয়ে transition করো
    const updatedOrder = this.stateMachine.transition(order, dto.status);
    return this.orderRepository.save(updatedOrder);
  }
}