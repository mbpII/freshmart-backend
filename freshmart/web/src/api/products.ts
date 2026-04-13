import type {
  CreateProductInput,
  Product,
  ProductCatalog,
  UpdateProductInput,
} from "../types/product";
import { DEFAULT_STORE_ID } from "../lib/constants";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const rawError = await response.text();

    let parsedMessage = "";
    try {
      const parsed = JSON.parse(rawError) as { message?: string };
      parsedMessage = parsed.message ?? "";
      console.error("API validation error:", parsed);
    } catch {
      parsedMessage = rawError;
      console.error("API error response:", rawError);
    }

    if (parsedMessage.includes("Insufficient inventory")) {
      throw new Error("Cannot complete sell, insufficient inventory");
    }

    throw new Error(parsedMessage || `HTTP ${response.status}`);
  }
  return response.json();
}

function mapProductFromApi(data: Record<string, unknown>): Product {
  return {
    productId: Number(data.productId),
    storeId: Number(data.storeId),
    productName: data.productName as string,
    category: data.category as string,
    upc: data.upc as string,
    supplierName: data.supplierName as string | undefined,
    unitCost: data.unitCost != null ? Number(data.unitCost) : undefined,
    retailPrice: Number(data.retailPrice),
    isOnSale: data.isOnSale as boolean,
    salesPriceModifier:
      data.salesPriceModifier != null ? Number(data.salesPriceModifier) : undefined,
    salePrice: data.salePrice != null ? Number(data.salePrice) : undefined,
    quantityOnHand: Number(data.quantityOnHand),
    lastUpdated: data.lastUpdated as string,
    isFood: data.isFood as boolean,
    isActive: data.isActive as boolean,
    expirationDate: data.expirationDate as string | undefined,
    reorderThreshold:
      data.reorderThreshold != null ? Number(data.reorderThreshold) : undefined,
    reorderQuantity:
      data.reorderQuantity != null ? Number(data.reorderQuantity) : undefined,
    inventoryId: data.inventoryId != null ? Number(data.inventoryId) : undefined,
  };
}

function mapProductCatalogFromApi(
  data: Record<string, unknown>,
): ProductCatalog {
  return {
    productId: Number(data.productId),
    productName: data.productName as string,
    category: data.category as string,
    upc: data.upc as string,
    supplierName: data.supplierName as string | undefined,
    unitCost: data.unitCost != null ? Number(data.unitCost) : undefined,
    retailPrice: Number(data.retailPrice),
    isOnSale: data.isOnSale as boolean,
    salesPriceModifier:
      data.salesPriceModifier != null ? Number(data.salesPriceModifier) : undefined,
    salePrice: data.salePrice != null ? Number(data.salePrice) : undefined,
    isFood: data.isFood as boolean,
    reorderThreshold:
      data.reorderThreshold != null ? Number(data.reorderThreshold) : undefined,
    reorderQuantity:
      data.reorderQuantity != null ? Number(data.reorderQuantity) : undefined,
    expirationDate: data.expirationDate as string | undefined,
    isActive: data.isActive as boolean,
  };
}

export const productApi = {
  getAll: async (storeId: number = DEFAULT_STORE_ID): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/products?storeId=${storeId}`);
    const data = await handleResponse<Record<string, unknown>[]>(res);
    return data.map(mapProductFromApi);
  },

  getById: async (
    id: number,
    storeId: number = DEFAULT_STORE_ID,
  ): Promise<Product> => {
    const res = await fetch(`${API_BASE}/stores/${storeId}/inventory/${id}`);
    const data = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(data);
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(responseData);
  },

  update: async (
    id: number,
    data: UpdateProductInput,
  ): Promise<ProductCatalog> => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<Record<string, unknown>>(res);
    return mapProductCatalogFromApi(responseData);
  },

  archive: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || `HTTP ${res.status}`);
    }
  },

  markOnSale: async (
    id: number,
    salesPriceModifier: number,
    storeId: number = DEFAULT_STORE_ID,
  ): Promise<Product> => {
    const params = new URLSearchParams({
      storeId: String(storeId),
      salesPriceModifier: String(salesPriceModifier),
    });
    const res = await fetch(
      `${API_BASE}/products/${id}/sale?${params.toString()}`,
      {
        method: "POST",
      },
    );
    const responseData = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(responseData);
  },

  removeSale: async (
    id: number,
    storeId: number = DEFAULT_STORE_ID,
  ): Promise<Product> => {
    const params = new URLSearchParams({ storeId: String(storeId) });
    const res = await fetch(
      `${API_BASE}/products/${id}/sale?${params.toString()}`,
      {
        method: "DELETE",
      },
    );
    const responseData = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(responseData);
  },

  receiveStock: async (
    id: number,
    quantityChange: number,
    notes: string,
    storeId: number = DEFAULT_STORE_ID,
  ): Promise<Product> => {
    const res = await fetch(
      `${API_BASE}/stores/${storeId}/inventory/${id}/receive`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantityChange, notes }),
      },
    );
    const responseData = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(responseData);
  },

  adjustStock: async (
    id: number,
    quantityChange: number,
    notes: string,
    storeId: number = DEFAULT_STORE_ID,
  ): Promise<Product> => {
    const res = await fetch(
      `${API_BASE}/stores/${storeId}/inventory/${id}/adjust`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantityChange, notes }),
      },
    );
    const responseData = await handleResponse<Record<string, unknown>>(res);
    return mapProductFromApi(responseData);
  },
};
