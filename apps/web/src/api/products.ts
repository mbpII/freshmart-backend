import type { CreateProductInput, Product, UpdateProductInput } from '../types/product';

export const productApi = {
  getAll: async (_storeId: number): Promise<Product[]> => {
    const res = await fetch('/products.json');
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  },

  getById: async (id: number, _storeId: number): Promise<Product> => {
    const res = await fetch('/products.json');
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    const product = data.products.find((p: Product) => p.productId === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    // Mock create - just log and return as-is
    console.log('Create product:', data);
    throw new Error('Create not implemented in static mode');
  },

  update: async (id: number, data: UpdateProductInput): Promise<Product> => {
    // Mock update - just log
    console.log('Update product', id, ':', data);
    throw new Error('Update not implemented in static mode');
  },

  delete: async (_id: number): Promise<void> => {
    // Mock delete - just log
    console.log('Delete product');
    throw new Error('Delete not implemented in static mode');
  },
};
