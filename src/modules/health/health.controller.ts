// src/modules/health/health.controller.ts
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '../../common/constants/queue.constants';

@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectQueue(QUEUES.ORDER)
    private readonly orderQueue: Queue,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System health check' })
  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()) + 's',
      services: {
        database: 'unknown',
        queue: 'unknown',
        memory: 'unknown',
      },
    };

    // Database check
    try {
      await this.dataSource.query('SELECT 1');
      checks.services.database = 'healthy';
    } catch {
      checks.services.database = 'unhealthy';
      checks.status = 'degraded';
    }

    // Queue check
    try {
      await this.orderQueue.getJobCounts();
      checks.services.queue = 'healthy';
    } catch {
      checks.services.queue = 'unhealthy';
      checks.status = 'degraded';
    }

    // Memory check
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    checks.services.memory = `${heapUsedMB}MB / ${heapTotalMB}MB`;

    return checks;
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (is app ready to serve?)' })
  async readiness() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ready' };
    } catch {
      return { status: 'not ready', reason: 'database unavailable' };
    }
  }
}