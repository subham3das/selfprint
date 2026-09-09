import { z } from 'zod';

export const adminLoginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'Administrator email is required')
      .email('Please enter a valid administrator email')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(1, 'Password is required')
      .optional()
  })
});
