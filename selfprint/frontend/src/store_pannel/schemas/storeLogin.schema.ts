import { z } from 'zod';

export const storeLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required')
});

export type StoreLoginFormValues = z.infer<typeof storeLoginSchema>;
