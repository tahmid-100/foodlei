// src/modules/health/health.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { QUEUES } from '../../common/constants/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.ORDER }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}