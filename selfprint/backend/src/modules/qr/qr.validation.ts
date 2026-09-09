import { z } from 'zod';

export const updateQRConfigSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  template: z.enum(['default', 'minimal', 'rounded', 'dark', 'colorful', 'classic']).optional(),
  uploadLimitMb: z.number().positive().max(500).optional(),
  welcomeMessage: z.string().max(300).optional(),
  expiry: z.string().optional()
});

export const qrAnalyticsQuerySchema = z.object({
  storeId: z.string().optional()
});

export type UpdateQRConfigInput = z.infer<typeof updateQRConfigSchema>;
