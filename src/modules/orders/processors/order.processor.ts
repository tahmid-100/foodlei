// src/modules/orders/processors/order.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUES, ORDER_JOBS } from '../../../common/constants/queue.constants';

@Processor(QUEUES.ORDER)
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

async process(job: Job): Promise<void> {
  this.logger.log(`Processing job: ${job.name} | ID: ${job.id}`);

  try {
    switch (job.name) {
      case ORDER_JOBS.SEND_CONFIRMATION:
        await this.sendConfirmationEmail(job.data);
        break;

      case ORDER_JOBS.NOTIFY_RESTAURANT:
        await this.notifyRestaurant(job.data);
        break;

      case ORDER_JOBS.SEND_DELIVERY_UPDATE:
        await this.sendDeliveryUpdate(job.data);
        break;

      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  } catch (error: unknown) {  // ← Explicitly type as unknown
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error(`❌ Job ${job.name} failed:`, errorMessage);
    throw error; // Re-throw so Bull knows it failed
  }
}

  private async sendConfirmationEmail(data: {
    orderId: number;
    customerEmail: string;
    totalAmount: number;
  }) {
    // Real app এ nodemailer/sendgrid use করবে
    // এখন simulate করছি
    this.logger.log(
      `📧 Email sent to ${data.customerEmail} | Order #${data.orderId} | ৳${data.totalAmount}`
    );

    // Email sending simulate (1 second delay)
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.logger.log(`✅ Email delivered for Order #${data.orderId}`);
  }

  private async notifyRestaurant(data: {
    orderId: number;
    restaurantId: number;
    items: any[];
  }) {
    this.logger.log(
      `🍔 Restaurant #${data.restaurantId} notified | Order #${data.orderId}`
    );
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async sendDeliveryUpdate(data: {
    orderId: number;
    customerEmail: string;
    status: string;
  }) {
    this.logger.log(
      `📱 SMS sent | Order #${data.orderId} is now ${data.status}`
    );
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}