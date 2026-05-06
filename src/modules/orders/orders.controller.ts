// src/modules/orders/orders.controller.ts
import {
  Controller, Get, Post, Body, Patch,
  Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@ApiTags('orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'নতুন order দাও' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.ordersService.create(dto, user);
  }

  @Get('my')
  @ApiOperation({ summary: 'আমার সব orders' })
  getMyOrders(@CurrentUser() user: User) {
    return this.ordersService.findMyOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'একটা order এর details' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Order status update (Admin/Owner only)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }
}