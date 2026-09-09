import { z } from 'zod';

export const userQuerySchema = z.object({
  searchQuery: z.string().optional(),
  status: z.string().optional(),
  store: z.string().optional(),
  city: z.string().optional(),
  plan: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'orders', 'spent', 'active', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required')
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(5, 'Phone number must be at least 5 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  storeId: z.string().nullable().optional(),
  membershipPlan: z.enum(['Basic', 'Pro', 'Enterprise', 'Student']).optional(),
  status: z.enum(['Active', 'Inactive', 'Blocked', 'Banned', 'Pending', 'Verified']).optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive', 'Blocked', 'Banned', 'Pending', 'Verified']),
  reason: z.string().optional()
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
