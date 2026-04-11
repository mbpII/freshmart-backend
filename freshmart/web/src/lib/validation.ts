import { z } from 'zod';

export const productFormSchema = z
  .object({
    productName: z.string().trim().min(1, 'Product name is required'),
    category: z.string().trim().min(1, 'Category is required'),
    upc: z.string().trim().min(1, 'UPC is required'),
    productType: z.enum(['food', 'non-food']),
    quantityOnHand: z.number().min(0, 'Initial quantity must be 0 or greater'),
    unitCost: z.number().min(0, 'Unit cost must be 0 or greater').optional(),
    reorderThreshold: z.number().min(0, 'Low stock threshold must be 0 or greater'),
    reorderQuantity: z.number().min(0, 'Reorder quantity must be 0 or greater'),
    retailPrice: z.number().gt(0, 'Retail price must be greater than 0'),
    expirationDate: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.productType === 'food' && !values.expirationDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expirationDate'],
        message: 'Expiration date is required for food products',
      });
    }
  });
