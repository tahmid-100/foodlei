// src/modules/orders/order-state-machine.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderStatus, VALID_TRANSITIONS } from './enums/order-status.enum';
import { Order } from './order.entity';

@Injectable()
export class OrderStateMachineService {

  // এই transition valid কিনা check করো
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return VALID_TRANSITIONS[from].includes(to);
  }

  // Transition করো এবং timestamp রাখো
  transition(order: Order, newStatus: OrderStatus): Order {
    if (!this.canTransition(order.status, newStatus)) {
      throw new BadRequestException(
        `Invalid transition: ${order.status} → ${newStatus}. ` +
        `Allowed: ${VALID_TRANSITIONS[order.status].join(', ') || 'none'}`
      );
    }

    order.status = newStatus;

    // Audit timestamps
    const now = new Date();
    switch (newStatus) {
      case OrderStatus.CONFIRMED:
        order.confirmedAt = now;
        break;
      case OrderStatus.PREPARING:
        order.preparedAt = now;
        break;
      case OrderStatus.DELIVERED:
        order.deliveredAt = now;
        break;
      case OrderStatus.CANCELLED:
        order.cancelledAt = now;
        break;
    }

    return order;
  }
}