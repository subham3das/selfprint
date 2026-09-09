import { z } from 'zod';

export const storeOnboardingSchema = z.object({
  storeDetails: z.object({
    storeName: z
      .string()
      .min(2, 'Store name must be at least 2 characters')
      .trim(),
    ownerName: z
      .string()
      .min(2, 'Owner name must be at least 2 characters')
      .trim(),
    email: z
      .string()
      .email('Please enter a valid email address')
      .trim()
      .toLowerCase(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
    alternatePhone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[6-9]\d{9}$/.test(val),
        'Alternate phone must be a valid 10-digit mobile number'
      ),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional(),
    storeAddress: z
      .string()
      .min(5, 'Store address must be at least 5 characters')
      .trim(),
    country: z.string().default('India'),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City is required').trim(),
    pinCode: z
      .string()
      .regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code'),
    gstNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(val),
        'Please enter a valid 15-character GSTIN format'
      ),
    storeImage: z.string().optional(),
    logo: z.string().optional()
  }),
  bankDetails: z.object({
    accountHolderName: z
      .string()
      .min(2, 'Account holder name is required')
      .trim(),
    bankName: z.string().min(2, 'Bank name is required').trim(),
    accountNumber: z
      .string()
      .min(9, 'Account number must be 9-18 digits')
      .max(18, 'Account number must be 9-18 digits')
      .regex(/^\d+$/, 'Account number must only contain digits'),
    confirmAccountNumber: z.string().optional(),
    ifscCode: z
      .string()
      .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Invalid IFSC format (e.g. SBIN0000088)')
      .toUpperCase()
      .trim(),
    branchName: z.string().optional(),
    upiId: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[\w.-]+@[\w.-]+$/.test(val),
        'Invalid UPI ID format (e.g. name@bank)'
      )
  }),
  confirmed: z.boolean().optional()
});

export const storeLoginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(3, 'Please enter your email or 10-digit mobile number')
    .trim(),
  password: z
    .string()
    .min(1, 'Please enter your password')
});

export default {
  storeOnboardingSchema,
  storeLoginSchema
};
