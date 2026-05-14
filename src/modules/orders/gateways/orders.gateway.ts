// src/modules/orders/gateways/orders.gateway.ts
import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders.service';
import { forwardRef, Inject } from '@nestjs/common';
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  constructor(
    private readonly jwtService: JwtService,       // ← inject
    private readonly configService: ConfigService, // ← inject
      @Inject(forwardRef(() => OrdersService))  // ← এটা যোগ করো
  private readonly ordersService: OrdersService,
     
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ── verifyToken method ──────────────────────
  private async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      return payload; // { sub, email, role }
    } catch {
      return null;    // invalid বা expired token
    }
  }

  @SubscribeMessage('track-order')
  async handleTrackOrder(
    @MessageBody() data: { orderId: number; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.verifyToken(data.token);
    if (!user) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    const order = await this.ordersService.findById(data.orderId);
    if (!order) {
      client.emit('error', { message: 'Order not found' });
      return;
    }

    if (order.customerId !== user.sub && user.role !== 'admin') {
      client.emit('error', { message: 'Not your order' });
      return;
    }

    client.join(`order-${data.orderId}`);
    client.emit('tracking-started', {
      message: `Now tracking order #${data.orderId}`,
      orderId: data.orderId,
    });
    this.logger.log(`Client ${client.id} tracking order #${data.orderId}`);
  }

  @SubscribeMessage('untrack-order')
  handleUntrackOrder(
    @MessageBody() data: { orderId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`order-${data.orderId}`);
  }

  notifyOrderStatus(orderId: number, status: string, data: any) {
    this.server.to(`order-${orderId}`).emit('order-status-update', {
      orderId, status,
      timestamp: new Date().toISOString(),
      ...data,
    });
    this.logger.log(`📡 Broadcasted "${status}" for order #${orderId}`);
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}