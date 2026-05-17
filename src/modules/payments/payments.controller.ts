// src/modules/payments/payments.controller.ts
import {
  Controller, Post, Get, Headers,
  Param, ParseIntPipe, Req, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ⚠️ Webhook endpoint এ Auth Guard নেই!
  // Stripe/external service এর কাছে token নেই
  // তার বদলে Signature verification করি
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payment webhook receiver' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-webhook-signature') signature: string,
  ) {
    // Raw body লাগবে signature verify করতে
    // JSON parse করলে signature মিলবে না!
    const rawBody = (req as any).rawBody;

    return this.paymentsService.handleWebhook(rawBody, signature);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Order এর payment history' })
  getOrderPayments(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentsService.getOrderPayments(orderId);
  }
}