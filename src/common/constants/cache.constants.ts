// src/common/constants/cache.constants.ts
export const CACHE_KEYS = {
  ALL_RESTAURANTS: 'restaurants:all',
  RESTAURANT: (id: number) => `restaurants:${id}`,
  RESTAURANT_MENUS: (id: number) => `restaurants:${id}:menus`,
} as const;

export const CACHE_TTL = {
  RESTAURANTS: 5 * 60 * 1000,   // 5 minutes
  MENUS: 10 * 60 * 1000,        // 10 minutes
} as const;