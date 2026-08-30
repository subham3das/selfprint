import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase()
});

export type LoginFormValues = z.infer<typeof loginSchema>;
