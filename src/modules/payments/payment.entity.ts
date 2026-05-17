// src/modules/payments/payment.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne,
} from 'typeorm';
import { Order } from '../orders/order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  SSLCOMMERZ = 'sslcommerz',
  MOCK = 'mock',    // development এ test করতে
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    default: PaymentProvider.MOCK,
  })
  provider!: PaymentProvider;

  @Column({ nullable: true })
  providerPaymentId!: string;    // Stripe এর payment_intent id

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ nullable: true })
  failureReason!: string;

  @ManyToOne(() => Order)
  order!: Order;

  @Column()
  orderId!: number;

  @CreateDateColumn()
  createdAt?: Date;
}