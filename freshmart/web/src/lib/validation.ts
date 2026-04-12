import { z } from 'zod';

export const productFormSchema = z
  .object({
    productName: z.string().trim().min(1, 'Product name is required'),
    category: z.string().trim().min(1, 'Category is required'),
    upc: z.string().trim().min(1, 'UPC is required'),
    productType: z.enum(['food', 'non-food']),
    quantityOnHand: z.number().min(0, 'Initial quantity must be 0 or greater'),
    retailPrice: z.number().gt(0, 'Retail price must be greater than 0'),
    reorderThreshold: z.number().min(0, 'Low stock threshold must be 0 or greater'),
    reorderQuantity: z.number().min(0, 'Reorder quantity must be 0 or greater'),
    expirationDate: z.string(),
    isOnSale: z.boolean(),
    saleMode: z.enum(['price', 'percent']),
    saleValue: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.productType === 'food' && !values.expirationDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expirationDate'],
        message: 'Expiration date is required for food products',
      });
    }
    if (values.isOnSale) {
      const val = parseFloat(values.saleValue ?? '');
      if (!Number.isFinite(val) || val <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['saleValue'],
          message: values.saleMode === 'price' ? 'Sale price must be greater than 0' : 'Percent off must be greater than 0',
        });
      }
      if (values.saleMode === 'price' && Number.isFinite(val) && val >= values.retailPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['saleValue'],
          message: 'Sale price must be lower than retail price',
        });
      }
      if (values.saleMode === 'percent' && Number.isFinite(val) && val >= 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['saleValue'],
          message: 'Percent off must be less than 100',
        });
      }
    }
  });