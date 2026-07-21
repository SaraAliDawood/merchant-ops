import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const productCreateSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default('AED'),
});

export const orderCreateSchema = z.object({
  customerId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'An order needs at least one line item.'),
});

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FULFILLED', 'CANCELLED']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
