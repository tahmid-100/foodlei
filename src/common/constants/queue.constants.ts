// src/common/constants/queue.constants.ts
export const QUEUES = {
  ORDER: 'order-queue',
} as const;

export const ORDER_JOBS = {
  SEND_CONFIRMATION: 'send-order-confirmation',
  NOTIFY_RESTAURANT: 'notify-restaurant',
  SEND_DELIVERY_UPDATE: 'send-delivery-update',
} as const;