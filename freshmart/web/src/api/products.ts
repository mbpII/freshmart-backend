import { z } from 'zod';
import type {
  CreateProductInput,
  Product,
  ProductCatalog,
  UpdateProductInput,
} from '../types/product';

const API_BASE = '/api';

const nullToUndefined = <T>(value: T | null | undefined): T | undefined =>
  value ?? undefined;

const optionalStringSchema = z
  .string()
  .optional()
  .nullable()
  .transform(nullToUndefined);

const optionalNumberSchema = z
  .coerce
  .number()
  .optional()
  .nullable()
  .transform(nullToUndefined);

const productSchema = z.object({
  productId: z.coerce.number(),
  storeId: z.coerce.number(),
  productName: z.string(),
  category: z.string(),
  upc: z.string(),
  supplierName: optionalStringSchema,
  unitCost: optionalNumberSchema,
  retailPrice: z.coerce.number(),
  isOnSale: z.boolean(),
  salesPriceModifier: optionalNumberSchema,
  salePrice: optionalNumberSchema,
  quantityOnHand: z.coerce.number(),
  lastUpdated: z.string(),
  isFood: z.boolean(),
  isActive: z.boolean(),
  expirationDate: optionalStringSchema,
  reorderThreshold: optionalNumberSchema,
  reorderQuantity: optionalNumberSchema,
  inventoryId: optionalNumberSchema,
});

const productCatalogSchema = z.object({
  productId: z.coerce.number(),
  productName: z.string(),
  category: z.string(),
  upc: z.string(),
  supplierName: optionalStringSchema,
  unitCost: optionalNumberSchema,
  retailPrice: z.coerce.number(),
  isOnSale: z.boolean(),
  salesPriceModifier: optionalNumberSchema,
  salePrice: optionalNumberSchema,
  isFood: z.boolean(),
  reorderThreshold: optionalNumberSchema,
  reorderQuantity: optionalNumberSchema,
  expirationDate: optionalStringSchema,
  isActive: z.boolean(),
});

function parseApiError(rawError: string, status: number): Error {
  let parsedMessage = '';

  try {
    const parsed = JSON.parse(rawError) as { message?: string };
    parsedMessage = parsed.message ?? '';
  } catch {
    parsedMessage = rawError;
  }

  if (parsedMessage.includes('Insufficient inventory')) {
    return new Error('Cannot complete sell, insufficient inventory');
  }

  return new Error(parsedMessage || `HTTP ${status}`);
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, init);

  if (!response.ok) {
    const rawError = await response.text();
    throw parseApiError(rawError, response.status);
  }

  return response.json();
}

async function requestNoContent(path: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, init);

  if (!response.ok) {
    const rawError = await response.text();
    throw parseApiError(rawError, response.status);
  }
}

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new Error(`Invalid ${context} response: ${parsed.error.issues[0]?.message ?? 'unknown schema error'}`);
  }

  return parsed.data;
}

function withStoreId(path: string, storeId: number): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}storeId=${storeId}`;
}

function jsonRequest(method: 'POST' | 'PUT', body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const productApi = {
  getAll: async (storeId: number): Promise<Product[]> => {
    const data = await requestJson(`/stores/${storeId}/inventory`);
    return parseWithSchema(z.array(productSchema), data, 'products list');
  },

  getById: async (
    id: number,
    storeId: number,
  ): Promise<Product> => {
    const data = await requestJson(`/stores/${storeId}/inventory/${id}`);
    return parseWithSchema(productSchema, data, 'product detail');
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    const responseData = await requestJson('/products', jsonRequest('POST', data));
    return parseWithSchema(productSchema, responseData, 'create product');
  },

  update: async (
    id: number,
    data: UpdateProductInput,
  ): Promise<ProductCatalog> => {
    const responseData = await requestJson(`/products/${id}`, jsonRequest('PUT', data));
    return parseWithSchema(productCatalogSchema, responseData, 'update product');
  },

  archive: async (id: number, storeId: number): Promise<void> => {
    await requestNoContent(`/stores/${storeId}/inventory/${id}`, { method: 'DELETE' });
  },

  markOnSaleByPercent: async (
    id: number,
    percentOff: number,
    storeId: number,
  ): Promise<Product> => {
    const data = await requestJson(
      `/products/${id}/sale/percent?storeId=${storeId}&value=${percentOff}`,
      { method: 'POST' },
    );
    return parseWithSchema(productSchema, data, 'mark on sale by percent');
  },

  markOnSaleByFlat: async (
    id: number,
    flatPrice: number,
    storeId: number,
  ): Promise<Product> => {
    const data = await requestJson(
      `/products/${id}/sale/flat?storeId=${storeId}&value=${flatPrice}`,
      { method: 'POST' },
    );
    return parseWithSchema(productSchema, data, 'mark on sale by flat price');
  },

  removeSale: async (
    id: number,
    storeId: number,
  ): Promise<Product> => {
    const data = await requestJson(withStoreId(`/products/${id}/sale`, storeId), {
      method: 'DELETE',
    });
    return parseWithSchema(productSchema, data, 'remove sale');
  },

  receiveStock: async (
    id: number,
    quantityChange: number,
    notes: string,
    storeId: number,
  ): Promise<Product> => {
    const data = await requestJson(
      `/stores/${storeId}/inventory/${id}/receive`,
      jsonRequest('POST', { quantityChange, notes }),
    );
    return parseWithSchema(productSchema, data, 'receive stock');
  },

  adjustStock: async (
    id: number,
    quantityChange: number,
    notes: string,
    storeId: number,
  ): Promise<Product> => {
    const data = await requestJson(
      `/stores/${storeId}/inventory/${id}/adjust`,
      jsonRequest('POST', { quantityChange, notes }),
    );
    return parseWithSchema(productSchema, data, 'adjust stock');
  },
};
