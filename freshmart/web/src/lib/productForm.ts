import type { CreateProductInput, Product, ProductFormData, UpdateProductInput } from '../types/product';
import { DEFAULT_STORE_ID } from './constants';

export function buildCreateProductInput(formData: ProductFormData): CreateProductInput {
  return {
    productName: formData.productName.trim(),
    category: formData.category,
    upc: formData.upc.trim(),
    unitCost: formData.unitCost,
    retailPrice: formData.retailPrice,
    isFood: formData.productType === 'food',
    initialQuantity: formData.quantityOnHand,
    storeId: DEFAULT_STORE_ID,
    reorderThreshold: formData.productType === 'food' ? formData.reorderThreshold ?? 0 : 0,
    reorderQuantity: formData.reorderQuantity ?? 0,
    expirationDate: formData.productType === 'food' ? formData.expirationDate || undefined : undefined,
  };
}

export function buildUpdateProductInput(formData: ProductFormData): UpdateProductInput {
  return {
    productName: formData.productName.trim(),
    category: formData.category,
    upc: formData.upc.trim(),
    unitCost: formData.unitCost,
    retailPrice: formData.retailPrice,
    isFood: formData.productType === 'food',
    reorderThreshold: formData.productType === 'food' ? formData.reorderThreshold ?? 0 : 0,
    reorderQuantity: formData.reorderQuantity ?? 0,
    expirationDate: formData.productType === 'food' ? formData.expirationDate || undefined : undefined,
  };
}

export function buildProductFormDefaults(product: Product): ProductFormData {
  return {
    productName: product.productName,
    category: product.category,
    upc: product.upc,
    quantityOnHand: product.quantityOnHand,
    unitCost: product.unitCost,
    reorderQuantity: product.reorderQuantity ?? 0,
    productType: product.isFood ? 'food' : 'non-food',
    reorderThreshold: product.reorderThreshold ?? 0,
    retailPrice: product.retailPrice,
    expirationDate: product.expirationDate ?? '',
  };
}
