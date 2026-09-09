import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Administrator email is required')
    .email('Please enter a valid administrator email')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .optional()
});

export type LoginFormValues = z.infer<typeof loginSchema>;
