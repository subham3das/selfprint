import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  storeId: z.string().optional()
});

export const queueQuerySchema = z.object({
  storeId: z.string().optional(),
  status: z.enum(['All', 'Printing', 'Waiting', 'Completed', 'Failed', 'Cancelled']).optional(),
  search: z.string().optional(),
  paperSize: z.string().optional(),
  colorMode: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'highest_pages', 'lowest_pages', 'price_high', 'price_low']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export const activityQuerySchema = z.object({
  storeId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).default(10)
});

export const notificationsQuerySchema = z.object({
  storeId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).default(10)
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
export type QueueQueryInput = z.infer<typeof queueQuerySchema>;
