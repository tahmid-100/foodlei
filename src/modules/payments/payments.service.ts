// src/modules/payments/payments.service.ts
import {
  Injectable, BadRequestException,
  Logger, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Payment, PaymentStatus, PaymentProvider } from './payment.entity';
import { Order } from '../orders/order.entity';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  // ── Signature Verification ──────────────────
  verifyWebhookSignature(payload: Buffer, signature: string): boolean {
    const secret = this.configService.get<string>('WEBHOOK_SECRET');
    
    if (!secret) {
      this.logger.error('WEBHOOK_SECRET environment variable is not set');
      return false;
    }

    // HMAC-SHA256 দিয়ে signature বানাও
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Timing-safe comparison — brute force prevent করে
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch {
      return false;
    }
  }

  // ── Webhook Handler ─────────────────────────
  async handleWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<{ received: boolean }> {

    // ১. Signature verify করো
    const isValid = this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      this.logger.warn('❌ Invalid webhook signature — possible fake request!');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // ২. Payload parse করো
    let event: any;
    try {
      event = JSON.parse(payload.toString());
    } catch {
      throw new BadRequestException('Invalid webhook payload');
    }

    this.logger.log(`✅ Webhook received: ${event.type}`);

    // ৩. Event type অনুযায়ী handle করো
    switch (event.type) {
      case 'payment.success':
        await this.handlePaymentSuccess(event.data);
        break;

      case 'payment.failed':
        await this.handlePaymentFailed(event.data);
        break;

      case 'payment.refunded':
        await this.handlePaymentRefunded(event.data);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  // ── Event Handlers ──────────────────────────
  private async handlePaymentSuccess(data: {
    orderId: number;
    paymentId: string;
    amount: number;
  }) {
    this.logger.log(`💰 Payment success for Order #${data.orderId}`);

    // Payment record বানাও
    const payment = this.paymentRepository.create({
      orderId: data.orderId,
      status: PaymentStatus.SUCCESS,
      provider: PaymentProvider.MOCK,
      providerPaymentId: data.paymentId,
      amount: data.amount,
    });
    await this.paymentRepository.save(payment);

    // Order confirm করো
    const order = await this.orderRepository.findOne({
      where: { id: data.orderId },
      relations: ['customer'],
    });

    if (order && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.CONFIRMED;
      order.confirmedAt = new Date();
      await this.orderRepository.save(order);
      this.logger.log(`✅ Order #${data.orderId} confirmed after payment`);
    }
  }

  private async handlePaymentFailed(data: {
    orderId: number;
    paymentId: string;
    reason: string;
  }) {
    this.logger.warn(`❌ Payment failed for Order #${data.orderId}`);

    const payment = this.paymentRepository.create({
      orderId: data.orderId,
      status: PaymentStatus.FAILED,
      provider: PaymentProvider.MOCK,
      providerPaymentId: data.paymentId,
      amount: 0,
      failureReason: data.reason,
    });
    await this.paymentRepository.save(payment);

    // Order cancel করো
    const order = await this.orderRepository.findOne({
      where: { id: data.orderId },
    });

    if (order && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = new Date();
      await this.orderRepository.save(order);
    }
  }

  private async handlePaymentRefunded(data: {
    orderId: number;
    paymentId: string;
  }) {
    this.logger.log(`↩️ Payment refunded for Order #${data.orderId}`);

    await this.paymentRepository.update(
      { providerPaymentId: data.paymentId },
      { status: PaymentStatus.REFUNDED },
    );
  }

  // ── Payment History ─────────────────────────
  async getOrderPayments(orderId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }
}