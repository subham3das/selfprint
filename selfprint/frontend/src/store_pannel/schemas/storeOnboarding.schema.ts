import { z } from 'zod';

export const storeDetailsSchema = z
  .object({
    storeName: z
      .string()
      .min(2, 'Store name must be at least 2 characters')
      .max(100, 'Store name cannot exceed 100 characters')
      .trim(),
    ownerName: z
      .string()
      .min(2, 'Owner name must be at least 2 characters')
      .max(80, 'Owner name cannot exceed 80 characters')
      .trim(),
    storeAddress: z
      .string()
      .min(5, 'Please provide a complete store address')
      .max(250, 'Address is too long')
      .trim(),
    country: z.string().min(1, 'Country is required'),
    state: z.string().min(1, 'State is required'),
    city: z.string().min(1, 'City is required'),
    pinCode: z
      .string()
      .regex(/^[1-9][0-9]{5}$/, 'PIN Code must be a valid 6-digit postal code'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
    alternatePhone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[6-9]\d{9}$/.test(val),
        'Alternate phone must be a valid 10-digit mobile number'
      ),
    email: z
      .string()
      .email('Please enter a valid email address')
      .trim()
      .toLowerCase(),
    gstNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val.toUpperCase()),
        'Please enter a valid 15-character GSTIN (e.g. 18AABCU9603R1ZM)'
      ),
    storeImage: z
      .string()
      .min(1, 'Please upload a photo of your print shop'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export type StoreDetailsSchemaValues = z.infer<typeof storeDetailsSchema>;

export const bankDetailsSchema = z
  .object({
    accountHolderName: z
      .string()
      .min(2, 'Account holder name is required')
      .trim(),
    bankName: z.string().min(2, 'Bank name is required').trim(),
    accountNumber: z
      .string()
      .regex(/^\d{9,18}$/, 'Account number must be between 9 and 18 digits'),
    confirmAccountNumber: z
      .string()
      .min(1, 'Please re-enter your account number'),
    ifscCode: z
      .string()
      .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Please enter a valid 11-character IFSC code (e.g. SBIN0001234)')
      .toUpperCase(),
    branchName: z.string().min(2, 'Branch name is required').trim(),
    upiId: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(val),
        'Please enter a valid UPI ID (e.g. yourshop@upi)'
      ),
    chequeImage: z.string().optional(),
    passbookImage: z.string().optional()
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: 'Account numbers do not match',
    path: ['confirmAccountNumber']
  });

export type BankDetailsSchemaValues = z.infer<typeof bankDetailsSchema>;
