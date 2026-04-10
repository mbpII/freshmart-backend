import type { CreateProductInput, Product, UpdateProductInput } from '../types/product';
import { DEFAULT_STORE_ID } from '../lib/constants';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }
  return response.json();
}

function mapProductFromApi(data: Record<string, unknown>): Product {
  return {
    productId: data.productId as number,
    storeId: data.storeId as number,
    productName: data.productName as string,
    category: data.category as string,
    upc: data.upc as string,
    supplierName: data.supplierName as string | undefined,
    unitCost: data.unitCost != null ? Number(data.unitCost) : undefined,
    retailPrice: Number(data.retailPrice),
    isOnSale: data.isOnSale as boolean,
    salePrice: data.salePrice != null ? Number(data.salePrice) : undefined,
    quantityOnHand: data.quantityOnHand as number,
    lastUpdated: data.lastUpdated as string,
    isFood: data.isFood as boolean,
    isActive: data.isActive as boolean,
    expirationDate: data.expirationDate as string | undefined,
    reorderThreshold: data.reorderThreshold as number | undefined,
    reorderQuantity: data.reorderQuantity as number | undefined,
    inventoryId: data.inventoryId as number | undefined,
  };
}

export const productApi = {
  getAll: async (storeId: number = DEFAULT_STORE_ID): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/products?storeId=${storeId}`);
    const data = await handleResponse<Record<string, unknown>[]>(res);
    return data.map(mapProductFromApi);
  },

  getById: async (id: number, storeId: number = DEFAULT_STORE_ID): Promise<Product> => {
    const res = await fetch(`${API_BASE}/stores/${storeId}/inventory/${id}`);
    const data = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(data);
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(responseData);
  },

  update: async (id: number, data: UpdateProductInput): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(responseData);
  },

  archive: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || `HTTP ${res.status}`);
    }
  },
};