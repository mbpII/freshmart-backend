import { z } from 'zod';
import { buildHttpErrorMessage } from '@/lib/errors';
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

function parseApiError(rawError: string): string {
  if (!rawError.trim()) return '';

  try {
    const parsed = JSON.parse(rawError) as { message?: string; error?: string };
    return parsed.message ?? parsed.error ?? rawError;
  } catch {
    return rawError;
  }
}

export const storeApi = {
  getAll: async (): Promise<Store[]> => {
    const path = '/stores';
    const response = await fetch(`${API_BASE}${path}`);

    if (!response.ok) {
      const rawError = await response.text();
      throw new Error(
        buildHttpErrorMessage({
          action: 'Store list load',
          path,
          status: response.status,
          detail: parseApiError(rawError),
        }),
      );
    }

    const data = await response.json();
    return parseWithSchema(z.array(storeSchema), data, 'stores list');
  },
};
