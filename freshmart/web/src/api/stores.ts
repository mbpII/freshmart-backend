import { z } from 'zod';
import type { Store } from '@/types/product';

const API_BASE = '/api';

const optionalStringSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => value ?? undefined);

const storeSchema = z.object({
  storeId: z.coerce.number(),
  storeName: z.string(),
  street: optionalStringSchema,
  city: z.string(),
  state: z.string(),
  zipCode: optionalStringSchema,
  phone: optionalStringSchema,
  active: z.boolean(),
});

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new Error(`Invalid ${context} response: ${parsed.error.issues[0]?.message ?? 'unknown schema error'}`);
  }

  return parsed.data;
}

export const storeApi = {
  getAll: async (): Promise<Store[]> => {
    const response = await fetch(`${API_BASE}/stores`);

    if (!response.ok) {
      throw new Error(`Unable to load stores: HTTP ${response.status}`);
    }

    const data = await response.json();
    return parseWithSchema(z.array(storeSchema), data, 'stores list');
  },
};
